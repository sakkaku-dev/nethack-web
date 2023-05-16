import { BehaviorSubject, Subject, debounceTime, filter, firstValueFrom, skip, tap } from "rxjs";
import { Command, Item, ItemFlag, NetHackJS, Status, Tile, statusMap } from "./models";
import { MENU_SELECT, STATUS_FIELD, WIN_TYPE } from "./generated";

// @ts-ignore
import nethackLib from "../lib/nethack";

export interface MenuSelect {
  winid: number;
  prompt?: string;
  count: number;
  items: Item[];
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Question {
  question: string;
  choices: string[];
}

export interface Window {
  type: WIN_TYPE;
}

export class NetHackWrapper implements NetHackJS {
  private commandMap: Partial<Record<Command, (...args: any[]) => Promise<any>>> = {
    [Command.CREATE_WINDOW]: this.createWindow.bind(this),
    [Command.DESTROY_WINDOW]: async (winid: number) => this.onCloseDialog$.next(winid),
    [Command.CLEAR_WINDOW]: async (winid: number) => (this.putStr = ""),

    // Text / Dialog
    [Command.PUTSTR]: this.handlePutStr.bind(this),
    [Command.RAW_PRINT]: async (str) => this.onPrint$.next(str),
    [Command.RAW_PRINT_BOLD]: async (str) => this.onPrint$.next(str),

    // Map
    [Command.PRINT_GLYPH]: async (winid, x, y, glyph) =>
      this.printTile$.next([
        ...this.printTile$.value,
        { x, y, tile: this.module._glyph_to_tile(glyph) },
      ]),

    [Command.CURSOR]: async (winid, x, y) =>
      winid == this.global.globals.WIN_MAP && this.onCursorMove$.next({ x, y }),
    [Command.CLIPAROUND]: async (x, y) => this.onMapCenter$.next({ x, y }),

    // Status
    [Command.STATUS_UPDATE]: this.statusUpdate.bind(this),

    // Menu
    [Command.MENU_START]: async () => (this.menu = { winid: 0, items: [], count: 0 }),
    [Command.MENU_END]: async (winid, prompt) => (this.menu.prompt = prompt),
    [Command.MENU_ADD]: this.menuAdd.bind(this),
    [Command.MENU_SELECT]: this.menuSelect.bind(this),

    // Waiting input
    [Command.DISPLAY_WINDOW]: this.displayWindow.bind(this),
    [Command.GET_CHAR]: this.waitInput.bind(this),
    [Command.GET_POSKEY]: this.waitInput.bind(this),
    [Command.YN_FUNCTION]: this.yesNoQuestion.bind(this),
    [Command.ASK_NAME]: this.waitInput.bind(this),

    // TODO: message_menu
    // TODO: select_menu with yn_function

    // TODO: improve performance
    // TODO: menu accelerators
  };

  private idCounter = 0;
  private menu: MenuSelect = { winid: 0, items: [], count: 0 };
  private putStr = "";
  private windows: Record<number, Window> = {};

  private input$ = new Subject<number>();
  private selectedMenu$ = new Subject<number[]>();

  private status$ = new BehaviorSubject<Status>({});
  private printTile$ = new BehaviorSubject<Tile[]>([]);
  private inventory$ = new Subject<Item[]>();

  onMenu$ = new Subject<MenuSelect>();
  onDialog$ = new Subject<{ id: number; text: string }>();
  onQuestion$ = new Subject<Question>();

  onCloseDialog$ = new Subject<number>();

  onPrint$ = new Subject<string>();
  onCursorMove$ = new Subject<Coordinate>();
  onMapCenter$ = new Subject<Coordinate>();

  onMapUpdate$ = new Subject<Tile[]>();
  onStatusUpdate$ = new Subject<Status>();
  onInventoryUpdate$ = new Subject<Item[]>();

  awaitingInput$ = new Subject<void>();

  private async yesNoQuestion(question: string, choices: string[]) {
    // Question already contains the choices
    if (/\[[a-zA-Z]+\]/.test(question)) {
      choices = [];
    }

    this.onQuestion$.next({ question, choices });
    return this.waitInput();
  }

  constructor(private debug = false, private module: any, private win: typeof window = window) {
    this.printTile$
      .pipe(
        skip(1),
        filter((x) => x.length > 0),
        debounceTime(100),
        tap((tiles) => this.onMapUpdate$.next(tiles)),
        tap(() => this.printTile$.next([]))
      )
      .subscribe();

    this.inventory$
      .pipe(
        filter((x) => x.length > 0),
        debounceTime(300),
        tap((items) => this.onInventoryUpdate$.next(items))
      )
      .subscribe();

    this.status$
      .pipe(
        skip(1),
        debounceTime(100),
        tap((s) => this.onStatusUpdate$.next(s))
      )
      .subscribe();

    this.win.nethackCallback = this.handle.bind(this);
    this.win.nethackJS = this;
  }

  private log(...args: any[]) {
    if (this.debug) {
      console.log(...args);
    }
  }

  public startGame() {
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

  // Waiting for input from user

  private async waitContinueKey() {
    this.log("Waiting for continue...");
    const acceptedCodes = [" ", "\n"].map((x) => x.charCodeAt(0));
    this.awaitingInput$.next();
    await firstValueFrom(this.input$.pipe(filter((x) => acceptedCodes.includes(x))));
  }

  private async waitInput() {
    this.log("Waiting user input...");
    this.awaitingInput$.next();
    return await firstValueFrom(this.input$);
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

    return 0;
  }

  private async createWindow(type: WIN_TYPE) {
    this.idCounter++;
    const id = this.idCounter;
    this.log("Create new window of type", type, "with id", id);
    this.windows[id] = { type };
    return id;
  }

  private async displayWindow(winid: number, blocking: number) {
    if (this.putStr !== "") {
      this.onDialog$.next({ id: winid, text: this.putStr });
      await this.waitContinueKey();
      this.putStr = "";
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
      tile: this.module._glyph_to_tile(glyph),
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
      this.inventoryUpdate(this.menu.items);
      return 0;
    }

    if (this.menu.items.length === 0) {
      return 0;
    }

    if (select == MENU_SELECT.PICK_NONE) {
      this.onDialog$.next({ id: winid, text: this.menu.items.map((i) => i.str).join("\n") });
      await this.waitContinueKey();
      return 0;
    }

    if (select == MENU_SELECT.PICK_ANY) {
      this.onMenu$.next({ ...this.menu, count: -1, winid });
    } else {
      this.onMenu$.next({ ...this.menu, count: 1, winid });
    }

    this.log("Waiting for menu select...");
    const selectedIds = await firstValueFrom(this.selectedMenu$);
    const itemIds = selectedIds.filter((id) => this.menu.items.find((x) => x.identifier === id));

    if (itemIds.length === 0) {
      return 0;
    }

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
    const selected_pp = this.global.helpers.getPointerValue("", selected, Type.POINTER);
    this.global.helpers.setPointerValue(
      "nethack.menu.setSelected",
      selected_pp,
      Type.INT,
      start_ptr
    );
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
          /Dlvl:(\d+).*\$:(\d+).*HP:(\d+)\((\d+)\).*Pw:(\d+)\((\d+)\).*AC:(\d+).*Exp:(\d+).*([a-zA-z\s]+)/
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
          statusMap[STATUS_FIELD.BL_CONDITION](status, m[9]);
        }
      }

      this.status$.next(status);
    } else {
      this.putStr += str + "\n";
    }
  }

  private async inventoryUpdate(items: Item[]) {
    this.inventory$.next(items);
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

  private getPointerValue(ptr: number, type: string) {
    const x = this.global.helpers.getPointerValue("nethack.pointerValue", ptr, Type.POINTER);
    return this.global.helpers.getPointerValue("nethack.pointerValue", x, type);
  }

  private get global() {
    return this.win.nethackGlobal;
  }
}

enum Type {
  INT = "i",
  STRING = "s",
  POINTER = "p",
}
