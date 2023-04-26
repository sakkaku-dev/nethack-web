import { CONDITION, STATUS_FIELD } from "./generated";

export interface NetHackJS {
  selectMenu: (items: any[]) => void; // TODO: param type
  sendInput: (key: number) => void;
}

// In Godot all parameters will be in one array, so don't nest them
export interface NetHackGodot {
  openMenuAny: (prompt: string, ...items: Item[]) => void;
  openMenuOne: (prompt: string, ...items: Item[]) => void;
  openDialog: (msg: string) => void;
  openQuestion: (question: string, ...choices: string[]) => void;

  moveCursor: (x: number, y: number) => void;
  centerView: (x: number, y: number) => void;
  printLine: (msg: string) => void;

  updateMap: (...tiles: Tile[]) => void;
  updateStatus: (status: Status) => void;
  updateInventory: (...items: Item[]) => void;
}

export interface Tile {
  x: number;
  y: number;
  tile: number;
}

export enum Command {
  YN_FUNCTION = "shim_yn_function",
  GET_CHAR = "shim_nhgetch",
  GET_POSKEY = "shim_nh_poskey",

  GET_HISTORY = "shim_getmsghistory",
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

  RAW_PRINT = "shim_raw_print",
  RAW_PRINT_BOLD = "shim_raw_print_bold",
}

export interface Item {
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

export const statusMap: Partial<Record<STATUS_FIELD, (s: Status, v: any) => void>> = {
  [STATUS_FIELD.BL_TITLE]: (s, v) => (s.title = v),
  [STATUS_FIELD.BL_STR]: (s, v) => (s.str = v),
  [STATUS_FIELD.BL_DX]: (s, v) => (s.dex = v),
  [STATUS_FIELD.BL_CO]: (s, v) => (s.con = v),
  [STATUS_FIELD.BL_IN]: (s, v) => (s.int = v),
  [STATUS_FIELD.BL_WI]: (s, v) => (s.wis = v),
  [STATUS_FIELD.BL_CH]: (s, v) => (s.cha = v),
  [STATUS_FIELD.BL_ALIGN]: (s, v) => (s.align = v),
  [STATUS_FIELD.BL_SCORE]: (s, v) => (s.score = v),
  [STATUS_FIELD.BL_CAP]: (s, v) => (s.carryCap = v),
  [STATUS_FIELD.BL_GOLD]: (s, v) => (s.gold = v),
  [STATUS_FIELD.BL_ENE]: (s, v) => (s.power = v),
  [STATUS_FIELD.BL_ENEMAX]: (s, v) => (s.powerMax = v),
  [STATUS_FIELD.BL_XP]: (s, v) => (s.expLvl = v),
  [STATUS_FIELD.BL_AC]: (s, v) => (s.armor = v),
  [STATUS_FIELD.BL_HUNGER]: (s, v) => (s.hunger = v),
  [STATUS_FIELD.BL_HP]: (s, v) => (s.hp = v),
  [STATUS_FIELD.BL_HPMAX]: (s, v) => (s.hpMax = v),
  [STATUS_FIELD.BL_LEVELDESC]: (s, v) => (s.dungeonLvl = v),
  [STATUS_FIELD.BL_EXP]: (s, v) => (s.exp = v),
  [STATUS_FIELD.BL_CONDITION]: (s, v) => (s.condition = v),
};
