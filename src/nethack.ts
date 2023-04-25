// @ts-ignore
import nethackLib from "../lib/nethack";
import {
  Command,
  MenuItem,
  Select,
  NetHackGodot,
  NetHackJS,
  Status,
  StatusType,
} from "./models";

import { Subject, debounceTime, firstValueFrom, tap } from "rxjs";

declare global {
  interface Window {
    nethackCallback: any;

    nethackJS: NetHackJS;
    nethackGodot: NetHackGodot;
  }
}

const ignored = [
  Command.INIT_WINDOW,
  Command.DISPLAY_WINDOW,
  Command.STATUS_INIT,
  Command.CLEAR_WINDOW,
];

let idCounter = 0;
let menu: MenuItem[] = [];
let menu_prompt = "";

const status: Status = {};
const selectedMenu$ = new Subject<any[]>();
const statusChange$ = new Subject<Status>();

statusChange$
  .pipe(
    debounceTime(300),
    tap(() => console.log("Update status", status))
  )
  .subscribe(() => window.nethackGodot.updateStatus(status));

window.nethackJS = {
  selectMenu: (items) => selectedMenu$.next(items),
};

const statusMap: Partial<Record<StatusType, (s: Status, v: any) => void>> = {
  [StatusType.BL_TITLE]: (s, v) => (s.title = v),
  [StatusType.BL_STR]: (s, v) => (s.str = v),
  [StatusType.BL_DX]: (s, v) => (s.dex = v),
  [StatusType.BL_CO]: (s, v) => (s.con = v),
  [StatusType.BL_IN]: (s, v) => (s.int = v),
  [StatusType.BL_WI]: (s, v) => (s.wis = v),
  [StatusType.BL_CH]: (s, v) => (s.cha = v),
  [StatusType.BL_ALIGN]: (s, v) => (s.align = v),
  [StatusType.BL_SCORE]: (s, v) => (s.score = v),
  [StatusType.BL_CAP]: (s, v) => (s.carryCap = v),
  [StatusType.BL_GOLD]: (s, v) => (s.gold = v),
  [StatusType.BL_ENE]: (s, v) => (s.power = v),
  [StatusType.BL_ENEMAX]: (s, v) => (s.powerMax = v),
  [StatusType.BL_XP]: (s, v) => (s.expLvl = v),
  [StatusType.BL_AC]: (s, v) => (s.armor = v),
  [StatusType.BL_HUNGER]: (s, v) => (s.hunger = v),
  [StatusType.BL_HP]: (s, v) => (s.hp = v),
  [StatusType.BL_HPMAX]: (s, v) => (s.hpMax = v),
  [StatusType.BL_LEVELDESC]: (s, v) => (s.dungeonLvl = v),
  [StatusType.BL_EXP]: (s, v) => (s.exp = v),
  [StatusType.BL_CONDITION]: (s, v) => (s.condition = v),
};

const commandMap: Partial<Record<Command, (...args: any[]) => Promise<any>>> = {
  [Command.CREATE_WINDOW]: async (...args: any[]) => {
    const id = idCounter++;
    return id;
  },
  [Command.MENU_START]: async (...args: any[]) => {
    menu = [];
  },
  [Command.MENU_ADD]: async (...args: any[]) => {
    menu.push({
      glyph: args[1],
      identifier: args[2],
      accelerator: args[3],
      groupAcc: args[4],
      attr: args[5],
      str: args[6],
    });
  },
  [Command.MENU_END]: async (...args: any[]) => {
    menu_prompt = args[1];
  },
  [Command.MENU_SELECT]: async (...args: any[]) => {
    const select = args[1] as Select;
    const selected = args[2] as any[];
    if (menu.length > 0 && select != Select.NONE) {
      if (select == Select.ANY) {
        window.nethackGodot.openMenuAny(menu);
      } else if (select == Select.ONE) {
        window.nethackGodot.openMenuOne(menu);
      }

      console.log(`Waiting for menu select (${select}): `, menu);
      const items = await firstValueFrom(selectedMenu$);
      items.forEach((x) => selected.push({ item: x, count: 1 }));
      return items.length;
    }

    return 0;
  },
  [Command.PRINT_TILE]: async (...args: any[]) => {
    window.nethackGodot.printTile(args[1], args[2], args[3]);
  },
  [Command.CURSOR]: async (...args: any[]) => {
    window.nethackGodot.moveCursor(args[1], args[2]);
  },
  [Command.CLIPAROUND]: async (...args: any[]) => {
    window.nethackGodot.centerView(args[0], args[1]);
  },
  [Command.STATUS_UPDATE]: async (...args: any[]) => {
    const mapper = statusMap[args[0] as StatusType];
    if (mapper) {
      mapper(status, args[1]);
      statusChange$.next(status);
    }
  },
};

window.nethackCallback = async (cmd: Command, ...args: string[]) => {
  if (ignored.includes(cmd)) {
    return 0;
  }

  const fn = commandMap[cmd];
  if (fn) {
    return await fn(...args);
  }

  // TODO: Unhandled commands
  console.log(cmd, args);
  switch (cmd) {
    case Command.GET_HISTORY:
      return "";
    case Command.YN_FUNCTION:
    case Command.MESSAGE_MENU:
      return 121; // y in ascii
  }

  return 0;
};

const Module: any = {
  onRuntimeInitialized: () => {
    Module.ccall(
      "shim_graphics_set_callback",
      null,
      ["string"],
      ["nethackCallback"],
      {
        async: true,
      }
    );
  },
};

console.log(window);
nethackLib(Module);
