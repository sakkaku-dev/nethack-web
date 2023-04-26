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

export class NetHackWrapper implements NetHackJS {
  private commandMap: Partial<Record<Command, (...args: any[]) => Promise<any>>> = {
    [Command.CREATE_WINDOW]: this.createWindow.bind(this),

    // Text / Dialog
    [Command.PUTSTR]: async (winid, attr, str) => (this.putStr = str),
    [Command.RAW_PRINT]: async (str) => this.onPrint$.next(str),
    [Command.RAW_PRINT_BOLD]: async (str) => this.onPrint$.next(str),

    // Map
    [Command.PRINT_TILE]: async (winid, x, y, tile) =>
      this.printTile$.next([...this.printTile$.value, { x, y, tile }]),
    [Command.CURSOR]: async (x, y) => this.onCursorMove$.next({ x, y }),
    [Command.CLIPAROUND]: async (x, y) => this.onMapCenter$.next({ x, y }),

    // Status
    [Command.STATUS_UPDATE]: this.statusUpdate.bind(this),

    // Menu
    [Command.MENU_START]: async () => (this.menu = { items: [] }),
    [Command.MENU_END]: async (winid, prompt) => (this.menu.prompt = prompt),
    [Command.MENU_ADD]: async (winid, glyph, identifier, accelerator, groupAcc, attr, str) =>
      this.menu.items.push({ glyph, identifier, accelerator, groupAcc, attr, str }),
    [Command.MENU_SELECT]: this.menuSelect.bind(this),

    // Waiting input
    [Command.DISPLAY_WINDOW]: this.displayWindow.bind(this),
    [Command.GET_CHAR]: async () => await firstValueFrom(this.input$),
    [Command.GET_POSKEY]: async () => await firstValueFrom(this.input$),
    [Command.YN_FUNCTION]: async (question: string, choices: string[]) => {
      this.onQuestion$.next({ question, choices });
      return await firstValueFrom(this.input$);
    },
  };

  private idCounter = 0;
  private menu: MenuSelect = { items: [] };
  private putStr = "";

  private input$ = new Subject<number>();
  private selectedMenu$ = new Subject<number[]>();

  private status$ = new BehaviorSubject<Status>({});
  private printTile$ = new BehaviorSubject<Tile[]>([]);

  onSingleMenu$ = new Subject<MenuSelect>();
  onMultiMenu$ = new Subject<MenuSelect>();
  onDialog$ = new Subject<string>();
  onQuestion$ = new Subject<Question>();

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
        tap(() => console.log("Update map")),
        tap((tiles) => this.onMapUpdate$.next(tiles)),
        tap(() => this.printTile$.next([]))
      )
      .subscribe();

    this.status$
      .pipe(
        skip(1),
        debounceTime(100),
        tap((s) => console.log("Update status", s))
      )
      .subscribe((s) => this.onStatusUpdate$.next(s));
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
    return id;
  }

  private async displayWindow(winid: number, blocking: number) {
    if (this.putStr !== "") {
      this.onDialog$.next(this.putStr);
      await firstValueFrom(this.input$);
      this.putStr = "";
    }
  }

  private async menuSelect(winid: number, select: MENU_SELECT, selected: any) {
    if (this.menu.items.length > 0 && select != MENU_SELECT.PICK_NONE) {
      if (select == MENU_SELECT.PICK_ANY) {
        this.onMultiMenu$.next(this.menu);
      } else if (select == MENU_SELECT.PICK_ONE) {
        this.onSingleMenu$.next(this.menu);
      }

      console.log(`Waiting for menu select (${select}): `, this.menu);
      const items = await firstValueFrom(this.selectedMenu$);
      items.forEach((x) => selected.push({ item: x, count: 1 }));
      return items.length;
    }

    return 0;
  }

  private async statusUpdate(type: STATUS_FIELD, ptr: number) {
    const mapper = statusMap[type];
    if (mapper) {
      let value;
      if (type == STATUS_FIELD.BL_CONDITION) {
        value = window.nethackGlobal.helpers.getPointerValue("", ptr, "n");
      } else {
        // console.log("Values for pointer", ptr, STATUS_FIELD[type]);
        // ["s", "p", "c", "0", "1", "n", "f", "d", "o"].forEach((t) => {
        //   console.log(window.nethackGlobal.helpers.getPointerValue("", ptr, t));
        // });
        value = window.nethackGlobal.helpers.getPointerValue("", ptr, "n");
      }

      var status = this.status$.value;
      mapper(status, value);
      this.status$.next(status);
    }
  }
}
