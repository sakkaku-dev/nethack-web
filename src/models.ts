import { CONDITION, STATUS_FIELD } from "./generated";

export interface NetHackJS {
  selectMenu: (items: any[]) => void; // TODO: param type
  sendInput: (key: number) => void;
}

// In Godot all parameters will be in one array, so don't nest them
export interface NetHackGodot {
  openMenu: (id: number, prompt: string, count: number, ...items: Item[]) => void;
  openDialog: (id: number, msg: string) => void;
  openQuestion: (question: string, ...choices: string[]) => void;

  closeDialog: (id: number) => void;

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
  GET_NH_EVENT = "shim_get_nh_event",
  GET_POSKEY = "shim_nh_poskey",
  ASK_NAME = "shim_askname",

  GET_HISTORY = "shim_getmsghistory",
  MESSAGE_MENU = "shim_message_menu",

  STATUS_INIT = "shim_status_init",
  STATUS_UPDATE = "shim_status_update",

  INIT_WINDOW = "shim_init_nhwindows",
  CREATE_WINDOW = "shim_create_nhwindow",
  DESTROY_WINDOW = "shim_destroy_nhwindow",
  DISPLAY_WINDOW = "shim_display_nhwindow",
  CLEAR_WINDOW = "shim_clear_nhwindow",

  MENU_START = "shim_start_menu",
  MENU_END = "shim_end_menu",
  MENU_ADD = "shim_add_menu",
  MENU_SELECT = "shim_select_menu",

  PRINT_GLYPH = "shim_print_glyph",
  CURSOR = "shim_curs",
  CLIPAROUND = "shim_cliparound",
  PUTSTR = "shim_putstr",

  RAW_PRINT = "shim_raw_print",
  RAW_PRINT_BOLD = "shim_raw_print_bold",
  DISPLAY_FILE = "shim_display_file",
}

export interface Item {
  tile: number;
  accelerator: string;
  groupAcc: string;
  attr: number;
  str: string;
  identifier: number;
  active: boolean;
}

export enum ItemFlag {
  NONE = 0,
  SELECTED = 1,
  SKIPINVERT = 2,
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

  gold: number;
  power: number;
  powerMax: number;
  exp: number;
  expLvl: number;
  armor: number;
  hp: number;
  hpMax: number;

  score: string;
  carryCap: string;
  hunger: string;
  dungeonLvl: string;
  condition?: string;

  // TODO: ??
  hd: any;
  time: any;
}

export type Status = Partial<StatusAll>;

export const statusMap: Partial<Record<STATUS_FIELD, (s: Status, v: string) => void>> = {
  [STATUS_FIELD.BL_TITLE]: (s, v) => (s.title = v),
  [STATUS_FIELD.BL_STR]: (s, v) => (s.str = parseInt(v)),
  [STATUS_FIELD.BL_DX]: (s, v) => (s.dex = parseInt(v)),
  [STATUS_FIELD.BL_CO]: (s, v) => (s.con = parseInt(v)),
  [STATUS_FIELD.BL_IN]: (s, v) => (s.int = parseInt(v)),
  [STATUS_FIELD.BL_WI]: (s, v) => (s.wis = parseInt(v)),
  [STATUS_FIELD.BL_CH]: (s, v) => (s.cha = parseInt(v)),
  [STATUS_FIELD.BL_ALIGN]: (s, v) => (s.align = v),
  [STATUS_FIELD.BL_SCORE]: (s, v) => (s.score = v),
  [STATUS_FIELD.BL_CAP]: (s, v) => (s.carryCap = v),
  [STATUS_FIELD.BL_GOLD]: (s, v) => (s.gold = parseInt(v.split(":")[1])),
  [STATUS_FIELD.BL_ENE]: (s, v) => (s.power = parseInt(v)),
  [STATUS_FIELD.BL_ENEMAX]: (s, v) => (s.powerMax = parseInt(v)),
  [STATUS_FIELD.BL_XP]: (s, v) => (s.expLvl = parseInt(v)),
  [STATUS_FIELD.BL_AC]: (s, v) => (s.armor = parseInt(v)),
  [STATUS_FIELD.BL_HUNGER]: (s, v) => (s.hunger = v),
  [STATUS_FIELD.BL_HP]: (s, v) => (s.hp = parseInt(v)),
  [STATUS_FIELD.BL_HPMAX]: (s, v) => (s.hpMax = parseInt(v)),
  [STATUS_FIELD.BL_LEVELDESC]: (s, v) => (s.dungeonLvl = v),
  [STATUS_FIELD.BL_EXP]: (s, v) => (s.exp = parseInt(v)),
  [STATUS_FIELD.BL_CONDITION]: (s, v) =>
    (s.condition = conditionMap[parseInt(v) as CONDITION] ?? undefined),
};

// See mswproc.c
export const conditionMap: Record<CONDITION, string> = {
  [CONDITION.BL_MASK_BAREH]: "Bare",
  [CONDITION.BL_MASK_BLIND]: "Blind",
  [CONDITION.BL_MASK_BUSY]: "Busy",
  [CONDITION.BL_MASK_CONF]: "Conf",
  [CONDITION.BL_MASK_DEAF]: "Deaf",
  [CONDITION.BL_MASK_ELF_IRON]: "Iron",
  [CONDITION.BL_MASK_FLY]: "Fly",
  [CONDITION.BL_MASK_FOODPOIS]: "FoodPois",
  [CONDITION.BL_MASK_GLOWHANDS]: "Glow",
  [CONDITION.BL_MASK_GRAB]: "Grab",
  [CONDITION.BL_MASK_HALLU]: "Hallu",
  [CONDITION.BL_MASK_HELD]: "Held",
  [CONDITION.BL_MASK_ICY]: "Icy",
  [CONDITION.BL_MASK_INLAVA]: "Lava",
  [CONDITION.BL_MASK_LEV]: "Lev",
  [CONDITION.BL_MASK_PARLYZ]: "Parlyz",
  [CONDITION.BL_MASK_RIDE]: "Ride",
  [CONDITION.BL_MASK_SLEEPING]: "Zzz",
  [CONDITION.BL_MASK_SLIME]: "Slime",
  [CONDITION.BL_MASK_SLIPPERY]: "Slip",
  [CONDITION.BL_MASK_STONE]: "Stone",
  [CONDITION.BL_MASK_STRNGL]: "Strngl",
  [CONDITION.BL_MASK_STUN]: "Stun",
  [CONDITION.BL_MASK_SUBMERGED]: "Sub",
  [CONDITION.BL_MASK_TERMILL]: "TermIll",
  [CONDITION.BL_MASK_TETHERED]: "Teth",
  [CONDITION.BL_MASK_TRAPPED]: "Trap",
  [CONDITION.BL_MASK_UNCONSC]: "Out",
  [CONDITION.BL_MASK_WOUNDEDL]: "Legs",
  [CONDITION.BL_MASK_HOLDING]: "Uhold",
};
