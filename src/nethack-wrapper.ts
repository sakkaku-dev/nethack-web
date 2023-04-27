import { BehaviorSubject, Subject, debounceTime, filter, firstValueFrom, skip, tap } from "rxjs";
import { Command, Item, NetHackJS, Status, Tile, statusMap } from "./models";
import { MENU_SELECT, STATUS_FIELD, WIN_TYPE } from "./generated";

export interface MenuSelect {
  prompt?: string;
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
    [Command.PRINT_TILE]: async (winid, x, y, tile) =>
      this.printTile$.next([...this.printTile$.value, { x, y, tile }]),
    [Command.CURSOR]: async (winid, x, y) =>
      winid == window.nethackGlobal.globals.WIN_MAP && this.onCursorMove$.next({ x, y }),
    [Command.CLIPAROUND]: async (x, y) => this.onMapCenter$.next({ x, y }),

    // Status
    [Command.STATUS_UPDATE]: this.statusUpdate.bind(this),

    // Menu
    [Command.MENU_START]: async () => (this.menu = { items: [] }),
    [Command.MENU_END]: async (winid, prompt) => (this.menu.prompt = prompt),
    [Command.MENU_ADD]: async (winid, glyph, identifier, accelerator, groupAcc, attr, str) =>
      this.menu.items.push({
        glyph: window.nethackGlobal.helpers.mapglyphHelper(glyph, 0, 0, 0),
        identifier,
        accelerator,
        groupAcc,
        attr,
        str,
      }),
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
  };

  private idCounter = 0;
  private menu: MenuSelect = { items: [] };
  private putStr = "";
  private windows: Record<number, Window> = {};

  private input$ = new Subject<number>();
  private selectedMenu$ = new Subject<number[]>();

  private status$ = new BehaviorSubject<Status>({});
  private printTile$ = new BehaviorSubject<Tile[]>([]);
  private inventory$ = new Subject<Item[]>();

  onSingleMenu$ = new Subject<MenuSelect>();
  onMultiMenu$ = new Subject<MenuSelect>();
  onDialog$ = new Subject<{ id: number; text: string }>();
  onQuestion$ = new Subject<Question>();

  onCloseDialog$ = new Subject<number>();

  onPrint$ = new Subject<string>();
  onCursorMove$ = new Subject<Coordinate>();
  onMapCenter$ = new Subject<Coordinate>();

  onMapUpdate$ = new Subject<Tile[]>();
  onStatusUpdate$ = new Subject<Status>();
  onInventoryUpdate$ = new Subject<Item[]>();

  constructor(private debug = false) {
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

  public selectMenu(items: any[]) {
    this.selectedMenu$.next(items);
  }

  public sendInput(key: number) {
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
      const acceptedCodes = [" ", "\n"].map((x) => x.charCodeAt(0));
      await firstValueFrom(this.input$.pipe(filter((x) => acceptedCodes.includes(x))));
      this.putStr = "";
    }
  }

  private async menuSelect(winid: number, select: MENU_SELECT, selected: any) {
    if (winid === window.nethackGlobal.globals.WIN_INVEN) {
      this.inventoryUpdate(this.menu.items);
      return 0;
    }

    if (this.menu.items.length > 0 && select != MENU_SELECT.PICK_NONE) {
      if (select == MENU_SELECT.PICK_ANY) {
        this.onMultiMenu$.next(this.menu);
      } else if (select == MENU_SELECT.PICK_ONE) {
        this.onSingleMenu$.next(this.menu);
      }

      // TODO: select
      const items = await firstValueFrom(this.selectedMenu$);
      items.forEach((x) => selected.push({ item: x, count: 1 }));
      return items.length;
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
        value = this.getPointerValue(ptr, "i");
      } else {
        value = this.getPointerValue(ptr, "s");
      }

      var status = this.status$.value;
      mapper(status, value);
      this.status$.next(status);
    } else {
      console.warn("Unhandled status type", STATUS_FIELD[type]);
    }
  }

  private getPointerValue(ptr: number, type: string) {
    const x = window.nethackGlobal.helpers.getPointerValue("nethack.pointerValue", ptr, "p");
    return window.nethackGlobal.helpers.getPointerValue("nethack.pointerValue", x, type);
  }
}
