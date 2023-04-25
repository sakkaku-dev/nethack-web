export interface NetHackJS {
  selectMenu: (items: any[]) => void; // TODO: param type
}

export interface NetHackGodot {
  openMenuAny: (items: MenuItem[]) => void;
  openMenuOne: (items: MenuItem[]) => void;
  printTile: (x: number, y: number, tile: number) => void;
  moveCursor: (x: number, y: number) => void;
}

export enum Command {
  GET_HISTORY = "shim_getmsghistory",
  YN_FUNCTION = "shim_yn_function",
  MESSAGE_MENU = "shim_message_menu",

  STATUS_INIT = "shim_status_init",

  INIT_WINDOW = "shim_init_nhwindows",
  CREATE_WINDOW = "shim_create_nhwindow",
  DISPLAY_WINDOW = "shim_display_nhwindow",
  CLEAR_WINDOW = "shim_clear_nhwindow",

  MENU_START = "shim_start_menu",
  MENU_END = "shim_end_menu",
  MENU_ADD = "shim_add_menu",
  MENU_SELECT = "shim_select_menu",

  PRINT_TILE = "shim_print_tile",
  CURSOR = "shim_curs",
}

export enum Select {
  NONE = 0,
  ONE = 1,
  ANY = 2,
}

export interface MenuItem {
  glyph: number;
  accelerator: string;
  groupAcc: string;
  attr: number;
  str: string;
  identifier: string;
}
