import { BehaviorSubject, Subject, debounceTime, filter, firstValueFrom, skip, tap } from "rxjs";
import { Item, NetHackJS, Status, NetHackUI, Tile } from "./models";
import { MENU_SELECT, STATUS_FIELD, WIN_TYPE } from "./generated";

// @ts-ignore
import nethackLib from "../lib/nethack";
import { Command, ItemFlag, statusMap } from "./nethack-models";

export interface MenuSelect {
  winid: number;
  prompt: string;
  count: number;
  items: Item[];
}

export interface Question {
  question: string;
  choices: string[];
}

export interface Window {
  type: WIN_TYPE;
}

const SAVE_FILES_STORAGE_KEY = 'sakkaku-dev-nethack-savefiles';
const MAX_STRING_LENGTH = 256 // defined in global.h BUFSZ

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
    [Command.PRINT_GLYPH]: async (winid, x, y, glyph) =>
      this.tiles$.next([...this.tiles$.value, { x, y, tile: this.toTile(glyph) }]),

    [Command.CURSOR]: async (winid, x, y) =>
      winid == this.global.globals.WIN_MAP && this.ui.moveCursor(x, y),
    [Command.CLIPAROUND]: async (x, y) => this.ui.centerView(x, y),

    // Status
    [Command.STATUS_UPDATE]: this.statusUpdate.bind(this),

    // Menu
    [Command.MENU_START]: async () => (this.menu = { winid: 0, items: [], count: 0, prompt: "" }),
    [Command.MENU_END]: async (winid, prompt) => (this.menu.prompt = prompt),
    [Command.MENU_ADD]: this.menuAdd.bind(this),
    [Command.MENU_SELECT]: this.menuSelect.bind(this),

    // Waiting input
    [Command.DISPLAY_WINDOW]: this.displayWindow.bind(this),
    [Command.GET_CHAR]: this.waitInput.bind(this),
    [Command.GET_POSKEY]: this.waitInput.bind(this),
    [Command.YN_FUNCTION]: this.yesNoQuestion.bind(this),
    [Command.ASK_NAME]: this.waitInput.bind(this),
    [Command.GET_LINE]: this.getLine.bind(this),
    [Command.GET_EXT_CMD]: this.getExtCmd.bind(this),

    // TODO: message_menu
    // TODO: select_menu with yn_function
  };

  private idCounter = 0;
  private menu: MenuSelect = { winid: 0, items: [], count: 0, prompt: "" };
  private putStr = "";
  private backupFile = '';

  private input$ = new Subject<number>();
  private selectedMenu$ = new Subject<number[]>();
  private line$ = new Subject<string>();

  private status$ = new BehaviorSubject<Status>({});
  private inventory$ = new Subject<Item[]>();
  private tiles$ = new BehaviorSubject<Tile[]>([]);
  private awaitingInput$ = new BehaviorSubject(false);
  private playing$ = new BehaviorSubject(false);

  constructor(private debug = false, private module: any, private win: typeof window = window) {
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
        debounceTime(500),
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
      if (this.playing$.value) {
        // TODO: auto save?
        return e.returnValue = 'Game progress will be lost if not saved.';
      }
    }

    if (!this.module.preRun) {
      this.module.preRun = [];
    }
    this.module.preRun.push(() => {
      this.loadSaveFiles();

      if (this.backupFile) {
        this.loadBackupSaveFile(this.backupFile);
      }
    });
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  public setBackupFile(file: string) {
    this.backupFile = file;
  }

  public startGame() {
    this.playing$.next(true);
    nethackLib(this.module);
  }

  // Getting input from user

  public selectMenu(items: number[]) {
    this.log("Selected menu", items);
    this.selectedMenu$.next(items);
  }

  public sendInput(key: number) {
    this.log("Receiced input", key);
    this.input$.next(key);
  }

  public sendLine(line: string) {
    if (line.length >= MAX_STRING_LENGTH) {
      this.log(`Line is too long. It can only be ${MAX_STRING_LENGTH} characters long.`, line);
    } else {
      this.log("Receiced line", line);
      this.line$.next(line);
    }
  }

  // Waiting for input from user

  private async waitInput() {
    this.log("Waiting user input...");
    this.awaitingInput$.next(true);
    return await firstValueFrom(this.input$);
  }

  private async waitLine() {
    this.log("Waiting user input line...");
    this.awaitingInput$.next(true);
    return await firstValueFrom(this.line$);
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

  private async getExtCmd(commandPointer: number, numCommands: number) {
    const commands = this.getArrayValue(commandPointer, numCommands);
    this.ui.openGetLine('#', ...commands);
    const line = await this.waitLine();
    const idx = commands.findIndex(x => x === line);

    if (idx >= 0 && idx < commands.length) {
      return idx;
    }

    return -1;
  }

  private async getLine(question: string, searchPointer: number) {
    this.ui.openGetLine(question);
    const line = await this.waitLine();
    const ptr = this.global.helpers.getPointerValue('nethack.getLine', searchPointer, Type.POINTER);
    this.global.helpers.setPointerValue('nethack.getLine', ptr, Type.STRING, line);
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
      await this.waitInput();
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
    console.log("Ended game with status", status)
    this.syncSaveFiles();
    this.playing$.next(false);
  }

  private syncSaveFiles() {
    console.log("Syncing save files");
    this.module.FS.syncfs((err: any) => {
      if (err) {
        console.warn('Failed to sync FS. Save might not work', err);
      }
    })

    // backup save files in case user forgets to save
    try {
      const savefiles = this.module.FS.readdir('/nethack/save');
      for (let i = 0; i < savefiles.length; ++i) {
        let file = savefiles[i];
        if (file == '.' || file == '..') continue;
        if (file === 'record') continue; // This is just in save folder, so it gets persisted, nethack should not delete it like the save file

        file = '/nethack/save/' + file;
        try {
          const data = btoa(String.fromCharCode.apply(null, this.module.FS.readFile(file, { encoding: 'binary' })));
          localStorage.setItem(`${SAVE_FILES_STORAGE_KEY}-${file}`, JSON.stringify({ data }));
        } catch (e) {
          console.warn('Failed to sync save file', file);
        }
      }
    } catch (e) { }
  }

  private loadSaveFiles() {
    const mod = this.module;
    try { mod.FS.mkdir('/nethack/save'); } catch (e) { }
    mod.FS.mount(mod.IDBFS, {}, '/nethack/save');
    mod.FS.syncfs(true, (err: any) => {
      if (err) {
        console.warn('Failed to sync FS. Save might not work', err);
      }
    });
  }

  public getBackupFiles(): string[] {
    const result: string[] = [];
    for (let i = 0, len = localStorage.length; i < len; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(SAVE_FILES_STORAGE_KEY)) {
        result.push(key.substring(SAVE_FILES_STORAGE_KEY.length + 1));
      }
    }

    return result;
  }

  private loadBackupSaveFile(file: string) {
    const strData = localStorage.getItem(`${SAVE_FILES_STORAGE_KEY}-${file}`);
    if (strData) {
      const { data } = JSON.parse(strData);
      try {
        const bytes = atob(data);
        var buf = new ArrayBuffer(bytes.length);
        var array = new Uint8Array(buf);
        for (var i = 0; i < bytes.length; ++i)
          array[i] = bytes.charCodeAt(i);
        this.module.FS.writeFile(file, array, { encoding: 'binary' });
      } catch (e) {
        console.warn('Failed to load backup file', e)
      }
    }
  }

  private async menuAdd(
    winid: number,
    glyph: number,
    identifier: number,
    accelerator: string,
    groupAcc: string,
    attr: number,
    str: string,
    flag: number
  ) {
    this.menu.items.push({
      tile: this.toTile(glyph),
      identifier,
      accelerator: parseInt(accelerator),
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
      this.menu.items.forEach((i) => (i.active = activeRegex.test(i.str)));
      this.inventory$.next(this.menu.items);
      return 0;
    }

    if (this.menu.items.length === 0) {
      return 0;
    }

    if (select == MENU_SELECT.PICK_NONE) {
      this.ui.openDialog(winid, this.menu.items.map((i) => i.str).join("\n"));
      await this.waitInput();
      return 0;
    }

    if (select == MENU_SELECT.PICK_ANY) {
      this.ui.openMenu(winid, this.menu.prompt, -1, ...this.menu.items);
    } else {
      this.ui.openMenu(winid, this.menu.prompt, 1, ...this.menu.items);
    }

    this.log("Waiting for menu select...");
    const selectedIds = await firstValueFrom(this.selectedMenu$);
    const itemIds = selectedIds.filter((id) => this.menu.items.find((x) => x.identifier === id));

    if (itemIds.length === 0) {
      return -1;
    }

    this.selectItems(itemIds, selected);
    return itemIds?.length ?? -1;
  }

  private async handlePutStr(winid: number, attr: any, str: string) {
    if (winid === this.global.globals.WIN_STATUS) {
      // 3.6 updates the status with putStr:
      // Web_user the Aspirant        St:9 Dx:12 Co:15 In:9 Wi:18 Ch:12  Lawful
      // Dlvl:1  $:0  HP:14(14) Pw:8(8) AC:7  Exp:1

      const status = this.status$.value;
      let m = str.match(
        /([a-zA-z]+) ([a-zA-z\s]+) .* St:(\d+)(\/[\d*]+)? Dx:(\d+) Co:(\d+) In:(\d+) Wi:(\d+) Ch:(\d+) .* ([a-zA-z]+)/
      );
      if (m) {
        const player = m[1]; // TODO: ?
        statusMap[STATUS_FIELD.BL_TITLE](status, m[2]);

        const str = m[3];
        const strPercent = m[4];
        statusMap[STATUS_FIELD.BL_STR](status, str + (strPercent || ""));

        statusMap[STATUS_FIELD.BL_DX](status, m[5]);
        statusMap[STATUS_FIELD.BL_CO](status, m[6]);
        statusMap[STATUS_FIELD.BL_IN](status, m[7]);
        statusMap[STATUS_FIELD.BL_WI](status, m[8]);
        statusMap[STATUS_FIELD.BL_CH](status, m[9]);
        statusMap[STATUS_FIELD.BL_ALIGN](status, m[10]);
      } else {
        let m = str.match(
          /Dlvl:(\d+).*\$:(\d+).*HP:(\d+)\((\d+)\).*Pw:(\d+)\((\d+)\).*AC:(\d+).*Exp:(\d+)[\s]+([\w\s]+)/
        );
        if (m) {
          statusMap[STATUS_FIELD.BL_LEVELDESC](status, m[1]);
          statusMap[STATUS_FIELD.BL_GOLD](status, m[2]);
          statusMap[STATUS_FIELD.BL_HP](status, m[3]);
          statusMap[STATUS_FIELD.BL_HPMAX](status, m[4]);
          statusMap[STATUS_FIELD.BL_ENE](status, m[5]);
          statusMap[STATUS_FIELD.BL_ENEMAX](status, m[6]);
          statusMap[STATUS_FIELD.BL_AC](status, m[7]);
          statusMap[STATUS_FIELD.BL_XP](status, m[8]);
          statusMap[STATUS_FIELD.BL_HUNGER](status, m[9]);
        }
      }

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
  private selectItems(itemIds: number[], selectedPointer: number) {
    const int_size = 4;
    const size = int_size * 3; // selected object has 3 fields
    const total_size = size * itemIds.length;
    const start_ptr = this.module._malloc(total_size);

    // write selected items to memory
    let ptr = start_ptr;
    itemIds.forEach((id) => {
      this.global.helpers.setPointerValue("nethack.menu.selected", ptr, Type.INT, id);
      this.global.helpers.setPointerValue("nethack.menu.selected", ptr + int_size, Type.INT, -1);
      this.global.helpers.setPointerValue("nethack.menu.selected", ptr + int_size * 2, Type.INT, 0);

      ptr += size;
    });

    // point selected to the first item
    const selected_pp = this.global.helpers.getPointerValue("", selectedPointer, Type.POINTER);
    this.global.helpers.setPointerValue(
      "nethack.menu.setSelected",
      selected_pp,
      Type.INT,
      start_ptr
    );
  }

  private toTile(glyph: number): number {
    return this.module._glyph_to_tile(glyph);
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

enum Type {
  INT = "i",
  STRING = "s",
  POINTER = "p",
}
