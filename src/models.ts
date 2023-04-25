export interface NetHackJS {
  selectMenu: (items: any[]) => void; // TODO: param type
}

export interface NetHackGodot {
  openMenuAny: (items: MenuItem[]) => void;
  openMenuOne: (items: MenuItem[]) => void;
  printTile: (x: number, y: number, tile: number) => void;
  moveCursor: (x: number, y: number) => void;
  centerView: (x: number, y: number) => void;
  updateStatus: (status: Status) => void;
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

export enum StatusType {
  BL_AC = 14,
  BL_ALIGN = 7,
  BL_CAP = 9,
  BL_CH = 6,
  BL_CHARACTERISTICS = -3,
  BL_CO = 3,
  BL_CONDITION = 22,
  BL_DX = 2,
  BL_ENE = 11,
  BL_ENEMAX = 12,
  BL_EXP = 21,
  BL_FLUSH = -1,
  BL_GOLD = 10,
  BL_HD = 15,
  BL_HP = 18,
  BL_HPMAX = 19,
  BL_HUNGER = 17,
  BL_IN = 4,
  BL_LEVELDESC = 20,
  BL_RESET = -2,
  BL_SCORE = 8,
  BL_STR = 1,
  BL_TIME = 16,
  BL_TITLE = 0,
  BL_WI = 5,
  BL_XP = 13,
  MAXBLSTATS = 23,
}

export enum Condition {
  BL_MASK_BAREH = 1,
  BL_MASK_BLIND = 2,
  BL_MASK_BUSY = 4,
  BL_MASK_CONF = 8,
  BL_MASK_DEAF = 16,
  BL_MASK_ELF_IRON = 32,
  BL_MASK_FLY = 64,
  BL_MASK_FOODPOIS = 128,
  BL_MASK_GLOWHANDS = 256,
  BL_MASK_GRAB = 512,
  BL_MASK_HALLU = 1024,
  BL_MASK_HELD = 2048,
  BL_MASK_HOLDING = 536870912,
  BL_MASK_ICY = 4096,
  BL_MASK_INLAVA = 8192,
  BL_MASK_LEV = 16384,
  BL_MASK_PARLYZ = 32768,
  BL_MASK_RIDE = 65536,
  BL_MASK_SLEEPING = 131072,
  BL_MASK_SLIME = 262144,
  BL_MASK_SLIPPERY = 524288,
  BL_MASK_STONE = 1048576,
  BL_MASK_STRNGL = 2097152,
  BL_MASK_STUN = 4194304,
  BL_MASK_SUBMERGED = 8388608,
  BL_MASK_TERMILL = 16777216,
  BL_MASK_TETHERED = 33554432,
  BL_MASK_TRAPPED = 67108864,
  BL_MASK_UNCONSC = 134217728,
  BL_MASK_WOUNDEDL = 268435456,
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
  condition: Condition;

  // TODO: ??
  hd: any;
  time: any;
}
export type Status = Partial<StatusAll>;
