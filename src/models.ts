import { CONDITION } from "./generated";

export interface NetHackJS {
  selectMenu: (items: any[]) => void; // TODO: param type
}

// In Godot all parameters will be in one array, so don't nest them
export interface NetHackGodot {
  openMenuAny: (prompt: string, ...items: MenuItem[]) => void;
  openMenuOne: (prompt: string, ...items: MenuItem[]) => void;
  printTile: (x: number, y: number, tile: number) => void;
  moveCursor: (x: number, y: number) => void;
  centerView: (x: number, y: number) => void;
  updateStatus: (status: Status) => void;

  showMessage: (msg: string) => void;
  showMenuText: (msg: string) => void;
  showFullText: (msg: string) => void;
}

export enum Command {
  GET_HISTORY = "shim_getmsghistory",
  YN_FUNCTION = "shim_yn_function",
  MESSAGE_MENU = "shim_message_menu",

  STATUS_INIT = "shim_status_init",
  STATUS_UPDATE = "shim_status_update",

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
  CLIPAROUND = "shim_cliparound",
  PUTSTR = "shim_putstr",
}

export interface MenuItem {
  glyph: number;
  accelerator: string;
  groupAcc: string;
  attr: number;
  str: string;
  identifier: string;
}

// See botl.c
interface StatusAll {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;

  title: string;
  align: string;

  score: number;
  gold: number;
  carryCap: number;
  power: number;
  powerMax: number;
  exp: number;
  expLvl: number;
  armor: number;
  hunger: number;
  hp: number;
  hpMax: number;

  dungeonLvl: string;
  experience: number;
  condition: CONDITION;

  // TODO: ??
  hd: any;
  time: any;
}
export type Status = Partial<StatusAll>;
