import { BehaviorSubject, Subject, debounceTime, filter, firstValueFrom, skip, tap } from "rxjs";
import { Command, Item, ItemFlag, NetHackJS, Status, Tile, statusMap } from "./models";
import { MENU_SELECT, STATUS_FIELD, WIN_TYPE } from "./generated";

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

    // Text / Dialog
    [Command.PUTSTR]: async (winid, attr, str) => (this.putStr += str + "\n"),
    [Command.RAW_PRINT]: async (str) => this.onPrint$.next(str),
    [Command.RAW_PRINT_BOLD]: async (str) => this.onPrint$.next(str),

    // Map
    [Command.PRINT_GLYPH]: async (winid, x, y, glyph) =>
      this.printTile$.next([
        ...this.printTile$.value,
        { x, y, tile: this.module._glyph_to_tile(glyph) },
      ]),

    [Command.CURSOR]: async (winid, x, y) =>
      winid == window.nethackGlobal.globals.WIN_MAP && this.onCursorMove$.next({ x, y }),
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
    [Command.GET_CHAR]: async () => await firstValueFrom(this.input$),
    [Command.GET_POSKEY]: async () => await firstValueFrom(this.input$),
    [Command.YN_FUNCTION]: async (question: string, choices: string[]) => {
      this.onQuestion$.next({ question, choices });
      return await firstValueFrom(this.input$);
    },
    [Command.ASK_NAME]: async () => await firstValueFrom(this.input$),
    [Command.DISPLAY_FILE]: this.displayFile.bind(this),

    // TODO: message_menu
    // TODO: display_file
    // TODO: select_menu with yn_function

    // TODO: character selection
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

  constructor(private debug = false, private module: any) {
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
  }

  private async displayFile(file: string, complain: number) {
    const text = this.module.FS.readFile("/dat/" + file, { encoding: "utf8" });
    this.onDialog$.next({ id: -1, text });
    await this.waitContinueKey();
  }

  public selectMenu(items: number[]) {
    console.log("Selected menu", items);
    this.selectedMenu$.next(items);
  }

  public sendInput(key: number) {
    console.log("Receiced input", key);
    this.input$.next(key);
  }

  async handle(cmd: Command, ...args: any[]) {
    if (this.debug) {
      console.log(cmd, args);
    }

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
    console.log("Create new window of type", type, "with id", id);
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

  private async waitContinueKey() {
    const acceptedCodes = [" ", "\n"].map((x) => x.charCodeAt(0));
    await firstValueFrom(this.input$.pipe(filter((x) => acceptedCodes.includes(x))));
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
      accelerator,
      groupAcc,
      attr,
      str,
      active: flag === ItemFlag.SELECTED,
    });
  }

  private async menuSelect(winid: number, select: MENU_SELECT, selected: number) {
    if (winid === window.nethackGlobal.globals.WIN_INVEN) {
      this.inventoryUpdate(this.menu.items);
      return 0;
    }

    if (this.menu.items.length > 0 && select != MENU_SELECT.PICK_NONE) {
      if (select == MENU_SELECT.PICK_ANY) {
        this.onMenu$.next({ ...this.menu, count: -1, winid });
      } else if (select == MENU_SELECT.PICK_ONE) {
        this.onMenu$.next({ ...this.menu, count: 1, winid });
      }

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
        window.nethackGlobal.helpers.setPointerValue("nethack.menu.selected", ptr, Type.INT, id);

        window.nethackGlobal.helpers.setPointerValue(
          "nethack.menu.selected",
          ptr + int_size,
          Type.INT,
          -1
        );

        window.nethackGlobal.helpers.setPointerValue(
          "nethack.menu.selected",
          ptr + int_size * 2,
          Type.INT,
          0
        );

        ptr += size;
      });

      // point selected to the first item
      const selected_pp = window.nethackGlobal.helpers.getPointerValue("", selected, Type.POINTER);
      window.nethackGlobal.helpers.setPointerValue(
        "nethack.menu.setSelected",
        selected_pp,
        Type.INT,
        start_ptr
      );
      return itemIds?.length ?? -1;
    }

    return 0;
  }

  private async inventoryUpdate(items: Item[]) {
    this.inventory$.next(items);
  }

  private async statusUpdate(type: STATUS_FIELD, ptr: number) {
    const ignored = [STATUS_FIELD.BL_FLUSH, STATUS_FIELD.BL_RESET];

    if (ignored.includes(type)) {
      return;
    }

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
      console.warn("Unhandled status type", STATUS_FIELD[type]);
    }
  }

  private getPointerValue(ptr: number, type: string) {
    const x = window.nethackGlobal.helpers.getPointerValue(
      "nethack.pointerValue",
      ptr,
      Type.POINTER
    );
    return window.nethackGlobal.helpers.getPointerValue("nethack.pointerValue", x, type);
  }
}

enum Type {
  INT = "i",
  STRING = "s",
  POINTER = "p",
}
