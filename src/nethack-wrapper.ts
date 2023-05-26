import { BehaviorSubject, Subject, debounceTime, filter, firstValueFrom, skip, tap } from "rxjs";
import { Item, NetHackJS, Status, NetHackUI, Tile, GameState } from "./models";
import { MENU_SELECT, STATUS_FIELD, WIN_TYPE } from "./generated";

// @ts-ignore
import nethackLib from "../lib/nethack.js";

import { Command, ItemFlag, statusMap } from "./nethack-models";
import { AccelIterator } from "./helper/accel-iterator";
import { NethackUtil, Type } from "./helper/nethack-util";
import {
  EMPTY_ITEM,
  clearMenuItems,
  getCountForSelect,
  setAccelerators,
  toggleMenuItems,
} from "./helper/menu-select";
import { listBackupFiles, loadSaveFiles, syncSaveFiles } from "./helper/save-files";
import { CONTINUE_KEYS, ESC } from "./helper/keys";
import { parseAndMapStatus } from "./helper/parse-status";

const MAX_STRING_LENGTH = 256; // defined in global.h BUFSZ

export class NetHackWrapper implements NetHackJS {
  private commandMap: Partial<Record<Command, (...args: any[]) => Promise<any>>> = {
    [Command.CREATE_WINDOW]: this.createWindow.bind(this),
    [Command.DESTROY_WINDOW]: async (winid: number) => this.ui.closeDialog(winid),
    [Command.CLEAR_WINDOW]: this.clearWindow.bind(this),
    // [Command.EXIT_WINDOWS]: this.exitWindows.bind(this),
    [Command.GAME_END]: this.gameEnd.bind(this),

    // Text / Dialog
    [Command.PUTSTR]: this.handlePutStr.bind(this),
    [Command.RAW_PRINT]: async (str) => this.ui.printLine(str),
    [Command.RAW_PRINT_BOLD]: async (str) => this.ui.printLine(str),

    // Map
    [Command.PRINT_GLYPH]: async (winid, x, y, glyph, bkglyph) => {
      this.tiles$.next([...this.tiles$.value, { x, y, tile: this.util.toTile(glyph) }]);
      if (bkglyph !== 0 && bkglyph !== 5991) {
        console.log(`%c Background Tile found! ${bkglyph}, ${this.util.toTile(bkglyph)}`, 'background: #222; color: #bada55');
      }
    },

    [Command.CURSOR]: async (winid, x, y) =>
      winid == this.global.globals.WIN_MAP && this.ui.moveCursor(x, y),
    [Command.CLIPAROUND]: async (x, y) => this.ui.centerView(x, y),

    // Status
    [Command.STATUS_UPDATE]: this.statusUpdate.bind(this),

    // Menu
    [Command.MENU_START]: async () => (this.menuItems = []),
    [Command.MENU_END]: async (winid, prompt) => (this.menuPrompt = prompt),
    [Command.MENU_ADD]: this.menuAdd.bind(this),
    [Command.MENU_SELECT]: this.menuSelect.bind(this),

    // Waiting input
    [Command.DISPLAY_WINDOW]: this.displayWindow.bind(this),
    [Command.GET_CHAR]: () => this.waitInput(),
    [Command.GET_POSKEY]: () => this.waitInput(),
    [Command.ASK_NAME]: () => this.waitInput(),
    [Command.YN_FUNCTION]: this.yesNoQuestion.bind(this),
    [Command.GET_LINE]: this.getLine.bind(this),
    [Command.GET_EXT_CMD]: this.getExtCmd.bind(this),

    // according to window.doc, a 50ms delay, but add more since drawing the tile takes longer
    [Command.DELAY_OUTPUT]: () => new Promise((resolve) => setTimeout(resolve, 100)),
    [Command.MESSAGE_MENU]: this.messageMenu.bind(this),

    // TODO: select_menu with yn_function
  };
  private idCounter = 0;
  private menuItems: Item[] = [];
  private menuPrompt = "";
  private putStr = "";
  private backupFile = "";
  private accel = new AccelIterator();

  private input$ = new Subject<number>();
  private line$ = new Subject<string>();

  private status$ = new BehaviorSubject<Status>({});
  private inventory$ = new Subject<Item[]>();
  private tiles$ = new BehaviorSubject<Tile[]>([]);
  private awaitingInput$ = new BehaviorSubject(false);
  private gameState$ = new BehaviorSubject(GameState.START);

  constructor(
    private debug = false,
    private module: any,
    private util: NethackUtil,
    private win: typeof window = window,
    private autostart = true
  ) {
    this.gameState$.pipe(tap((s) => this.ui.updateState(s))).subscribe();

    this.tiles$
      .pipe(
        skip(1),
        filter((x) => x.length > 0),
        debounceTime(100),
        tap((tiles) => this.ui.updateMap(...tiles)),
        tap(() => this.tiles$.next([]))
      )
      .subscribe();

    this.inventory$
      .pipe(
        filter((x) => x.length > 0),
        debounceTime(100),
        tap((items) => this.ui.updateInventory(...items))
      )
      .subscribe();

    this.status$
      .pipe(
        skip(1),
        debounceTime(100),
        tap((s) => this.ui.updateStatus(s))
      )
      .subscribe();

    this.input$.subscribe(() => this.awaitingInput$.next(false));

    this.win.nethackCallback = this.handle.bind(this);
    this.win.onbeforeunload = (e) => {
      if (this.isGameRunning()) {
        // TODO: auto save?
        return (e.returnValue = "Game progress will be lost if not saved.");
      }
    };

    this.win.onerror = (e) => {
      if (this.isGameRunning()) {
        const title = "An unexpected error occurred.";
        const unsaved = "Unfortunately the game progress could not be saved.";
        const backup =
          'Use the "Load from backup" in the main menu to restart from your latest save.';
        this.ui.openDialog(-1, `${title}\n${unsaved}\n\n${backup}`);
        this.waitInput(true).then(() => {
          this.ui.closeDialog(-1);
          this.gameState$.next(GameState.GAMEOVER);
        });
      }
    };

    if (!this.module.preRun) {
      this.module.preRun = [];
    }
    this.module.preRun.push(() => loadSaveFiles(this.module, this.backupFile));

    if (autostart) {
      this.openStartScreen();
    }
  }

  private async openStartScreen() {
    while (!this.isGameRunning()) {
      const id = await this.openCustomMenu("Welcome to NetHack", [
        "Start Game",
        "Load from backup",
      ]);

      switch (id) {
        case 0:
          this.gameState$.next(GameState.RUNNING);
          nethackLib(this.module);
          break;
        case 1:
          const files = listBackupFiles();
          const backupId = await this.openCustomMenu("Select backup file", files);
          if (backupId !== -1) {
            this.backupFile = files[backupId];
          }
          break;
      }
    }

    this.ui.closeDialog(-1);
  }

  private async openCustomMenu(prompt: string, buttons: string[]) {
    const items = buttons.map((file, i) => ({
      ...EMPTY_ITEM,
      str: file,
      identifier: i + 1,
    }));
    const ids = await this.startUserMenuSelect(-1, prompt, MENU_SELECT.PICK_ONE, items);
    if (ids.length) {
      return ids[0] - 1;
    }

    return -1;
  }

  private isGameRunning() {
    return this.gameState$.value === GameState.RUNNING;
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  // Getting input from user

  public async sendInput(...keys: (number | string)[]) {
    for (const key of keys) {
      const k = (typeof(key) === 'string') ? key.charCodeAt(0) : key;
      this.log("Sending input", k);
      this.input$.next(k);
      await this.waitForAwaitingInput();
    }
  }

  public sendLine(line: string) {
    if (line.length >= MAX_STRING_LENGTH) {
      this.log(`Line is too long. It can only be ${MAX_STRING_LENGTH} characters long.`, line);
    } else {
      this.line$.next(line);
    }
  }

  // Waiting for input from user

  private async waitInput(filterContinue = false) {
    this.awaitingInput$.next(true);
    return await firstValueFrom(
      this.input$.pipe(filter((c) => !filterContinue || CONTINUE_KEYS.includes(c)))
    );
  }

  private async waitLine() {
    this.awaitingInput$.next(true);
    return await firstValueFrom(this.line$);
  }

  private async waitForAwaitingInput() {
    return await firstValueFrom(this.awaitingInput$.pipe(filter(x => x)));
  }

  // Commands

  async handle(cmd: Command, ...args: any[]) {
    this.log(cmd, args);

    const commandHandler = this.commandMap[cmd];
    if (commandHandler) {
      return commandHandler(...args);
    }

    if (cmd == Command.GET_HISTORY) {
      return "";
    }

    return -1;
  }

  private async messageMenu(dismissAccel: string, how: number, mesg: string) {
    // Just information? currently known usage with (z)ap followed by (?)
    this.ui.printLine(mesg);
  }

  private async getExtCmd(commandPointer: number, numCommands: number) {
    const commands = this.getArrayValue(commandPointer, numCommands);
    this.ui.openGetLine("#", ...commands);
    const line = await this.waitLine();
    const idx = commands.findIndex((x) => x === line);

    if (idx >= 0 && idx < commands.length) {
      return idx;
    }

    return -1;
  }

  private async getLine(question: string, searchPointer: number) {
    this.ui.openGetLine(question);
    const line = await this.waitLine();
    const ptr = this.global.helpers.getPointerValue("nethack.getLine", searchPointer, Type.POINTER);
    this.global.helpers.setPointerValue("nethack.getLine", ptr, Type.STRING, line);
  }

  private async yesNoQuestion(question: string, choices: string[]) {
    // Question already contains the choices
    if (/\[[a-zA-Z]+\]/.test(question)) {
      choices = [];
    }

    this.ui.openQuestion(question, ...choices);
    return this.waitInput();
  }

  private async createWindow(type: WIN_TYPE) {
    this.idCounter++;
    return this.idCounter;
  }

  private async displayWindow(winid: number, blocking: number) {
    if (this.putStr !== "") {
      this.ui.openDialog(winid, this.putStr);
      await this.waitInput(true);
      this.putStr = "";
    }
  }

  private async clearWindow(winid: number) {
    if (winid === this.global.globals.WIN_MAP) {
      this.ui.clearMap();
    }
    this.putStr = "";
  }

  private async gameEnd(status: number) {
    this.log("Ended game with status", status);
    syncSaveFiles(this.module);
    this.gameState$.next(GameState.GAMEOVER);
  }

  private async menuAdd(
    winid: number,
    glyph: number,
    identifier: number,
    accelerator: number,
    groupAcc: number,
    attr: number,
    str: string,
    flag: number
  ) {
    this.menuItems.push({
      tile: this.util.toTile(glyph),
      identifier,
      accelerator,
      groupAcc,
      attr,
      str,
      active: flag === ItemFlag.SELECTED,
    });
  }

  private async menuSelect(winid: number, select: MENU_SELECT, selected: number) {
    if (winid === this.global.globals.WIN_INVEN) {
      const activeRegex =
        /\((wielded( in other hand)?|in quiver|weapon in hands?|being worn|on (left|right) (hand|foreclaw|paw|pectoral fin))\)/;
      this.menuItems.forEach((i) => (i.active = activeRegex.test(i.str)));
      this.inventory$.next(this.menuItems);
      return 0;
    }

    if (this.menuItems.length === 0) {
      return 0;
    }

    const itemIds = await this.startUserMenuSelect(winid, this.menuPrompt, select, this.menuItems);
    this.ui.closeDialog(winid); // sometimes it's not closed
    if (itemIds.length === 0) {
      return -1;
    }

    this.util.selectItems(itemIds, selected);
    return itemIds.length;
  }

  private async handlePutStr(winid: number, attr: any, str: string) {
    if (winid === this.global.globals.WIN_STATUS) {
      const status = this.status$.value;
      parseAndMapStatus(str, status);
      this.status$.next(status);
    } else {
      this.putStr += str + "\n";
    }
  }

  private async statusUpdate(type: STATUS_FIELD, ptr: number) {
    // const ignored = [STATUS_FIELD.BL_FLUSH, STATUS_FIELD.BL_RESET];

    // if (ignored.includes(type)) {
    //   return;
    // }

    const mapper = statusMap[type];
    if (mapper) {
      let value;
      if (type == STATUS_FIELD.BL_CONDITION) {
        value = this.getPointerValue(ptr, Type.INT);
      } else {
        value = this.getPointerValue(ptr, Type.STRING);
      }

      var status = this.status$.value;
      mapper(status, value);
      this.status$.next(status);
    } else {
      this.log("Unhandled status type", STATUS_FIELD[type]);
    }
  }

  // Utils
  private async startUserMenuSelect(
    id: number,
    prompt: string,
    select: MENU_SELECT,
    items: Item[]
  ) {
    setAccelerators(items, this.accel);

    const count = getCountForSelect(select);
    let char = 0;

    while (!CONTINUE_KEYS.includes(char)) {
      this.ui.openMenu(id, prompt, count, ...items);
      char = await this.waitInput();
      if (count !== 0) {
        toggleMenuItems(char, count, items);

        if (count === 1 && items.some(i => i.active)) {
          break;
        }
      }
    }

    if (char === ESC) {
      clearMenuItems(items);
    }

    return items.filter((i) => i.active).map((i) => i.identifier);
  }

  private getPointerValue(ptr: number, type: string) {
    const x = this.global.helpers.getPointerValue("nethack.pointerValue", ptr, Type.POINTER);
    return this.global.helpers.getPointerValue("nethack.pointerValue", x, type);
  }

  // ptr should be a pointer to a pointer
  private getArrayValue(ptr: number, length: number): any[] {
    const arr: any[] = [];
    const pointer = this.global.helpers.getPointerValue("nethack.arrayValue", ptr, Type.POINTER);
    for (let i = 0; i < length; i++) {
      const value = this.getPointerValue(pointer + i * 4, Type.STRING);
      arr.push(value);
    }

    return arr;
  }

  private get global() {
    return this.win.nethackGlobal;
  }

  private get ui(): NetHackUI {
    return this.win.nethackUI;
  }
}
