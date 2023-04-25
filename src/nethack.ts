// @ts-ignore
import nethackLib from "../lib/nethack";
import { Command, MenuItem, Select, NetHackGodot, NetHackJS } from "./models";

import { Subject, firstValueFrom } from "rxjs";

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

const selectedMenu$ = new Subject<any[]>();

window.nethackJS = {
  selectMenu: (items) => selectedMenu$.next(items),
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
      glyph: args[0],
      identifier: args[1],
      accelerator: args[2],
      groupAcc: args[3],
      attr: args[4],
      str: args[5],
    });
  },
  [Command.MENU_END]: async (...args: any[]) => {
    menu_prompt = args[0];
  },
  [Command.MENU_SELECT]: async (...args: any[]) => {
    const select = args[0] as Select;
    const selected = args[1] as any[];
    if (menu.length > 0 && select != Select.NONE) {
      if (select == Select.ANY) {
        window.nethackGodot.openMenuAny(menu);
      } else if (select == Select.ONE) {
        window.nethackGodot.openMenuOne(menu);
      }

      const items = await firstValueFrom(selectedMenu$);
      items.forEach((x) => selected.push({ item: x, count: 1 }));
      return items.length;
    }

    return 0;
  },
  [Command.PRINT_TILE]: async (...args: any[]) => {
    window.nethackGodot.printTile(args[0], args[1], args[2]);
  },
  [Command.CURSOR]: async (...args: any[]) => {
    window.nethackGodot.moveCursor(args[0], args[1]);
  },
};

window.nethackCallback = async (cmd: Command, ...args: string[]) => {
  if (ignored.includes(cmd)) {
    return 0;
  }

  const fn = commandMap[cmd];
  if (fn) {
    return await fn();
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
  onRunTimeInitialized: () => {
    Module.ccall("shim_graphics_set_callback", null, ["string"], ["nethackCallback"], {
      async: true,
    });
  },
};

nethackLib(Module);
