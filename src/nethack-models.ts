import { CONDITION, STATUS_FIELD } from "./generated";
import { Status } from "./models";

export enum Command {
  YN_FUNCTION = "shim_yn_function",
  GET_CHAR = "shim_nhgetch",
  GET_NH_EVENT = "shim_get_nh_event",
  GET_POSKEY = "shim_nh_poskey",
  ASK_NAME = "shim_askname",
  GET_LINE = "shim_getlin",
  GET_EXT_CMD = "shim_get_ext_cmd_helper",

  GET_HISTORY = "shim_getmsghistory",
  MESSAGE_MENU = "shim_message_menu",

  STATUS_INIT = "shim_status_init",
  STATUS_UPDATE = "shim_status_update",

  CREATE_WINDOW = "shim_create_nhwindow",
  DESTROY_WINDOW = "shim_destroy_nhwindow",
  DISPLAY_WINDOW = "shim_display_nhwindow",
  CLEAR_WINDOW = "shim_clear_nhwindow",
  EXIT_WINDOWS = "shim_exit_nhwindows",

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
  GAME_END = "shim_game_end",
}

export enum ItemFlag {
  NONE = 0,
  SELECTED = 1,
  SKIPINVERT = 2,
}

export const statusMap: Record<STATUS_FIELD, (s: Status, v: string) => void> = {
  [STATUS_FIELD.BL_TITLE]: (s, v) => (s.title = v),
  [STATUS_FIELD.BL_STR]: (s, v) => (s.str = v),
  [STATUS_FIELD.BL_DX]: (s, v) => (s.dex = parseInt(v)),
  [STATUS_FIELD.BL_CO]: (s, v) => (s.con = parseInt(v)),
  [STATUS_FIELD.BL_IN]: (s, v) => (s.int = parseInt(v)),
  [STATUS_FIELD.BL_WI]: (s, v) => (s.wis = parseInt(v)),
  [STATUS_FIELD.BL_CH]: (s, v) => (s.cha = parseInt(v)),
  [STATUS_FIELD.BL_ALIGN]: (s, v) => (s.align = v),
  [STATUS_FIELD.BL_SCORE]: (s, v) => (s.score = v),
  [STATUS_FIELD.BL_CAP]: (s, v) => (s.carryCap = v),
  // [STATUS_FIELD.BL_GOLD]: (s, v) => (s.gold = parseInt(v.split(":")[1])),
  [STATUS_FIELD.BL_GOLD]: (s, v) => (s.gold = parseInt(v)),
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
  // [STATUS_FIELD.BL_CHARACTERISTICS]: () => {},
  // [STATUS_FIELD.BL_RESET]: () => {},
  // [STATUS_FIELD.BL_FLUSH]: () => {},
  [STATUS_FIELD.BL_HD]: () => { },
  [STATUS_FIELD.BL_TIME]: () => { },
  // [STATUS_FIELD.MAXBLSTATS]: () => {},
};

// See mswproc.c
export const conditionMap: Record<CONDITION, string> = {
  [CONDITION.BL_MASK_BLIND]: "Blind",
  [CONDITION.BL_MASK_CONF]: "Conf",
  [CONDITION.BL_MASK_DEAF]: "Deaf",
  [CONDITION.BL_MASK_FLY]: "Fly",
  [CONDITION.BL_MASK_FOODPOIS]: "FoodPois",
  [CONDITION.BL_MASK_HALLU]: "Hallu",
  [CONDITION.BL_MASK_LEV]: "Lev",
  [CONDITION.BL_MASK_RIDE]: "Ride",
  [CONDITION.BL_MASK_SLIME]: "Slime",
  [CONDITION.BL_MASK_STONE]: "Stone",
  [CONDITION.BL_MASK_STRNGL]: "Strngl",
  [CONDITION.BL_MASK_STUN]: "Stun",
  [CONDITION.BL_MASK_TERMILL]: "TermIll",

  // [CONDITION.BL_MASK_BAREH]: "Bare",
  // [CONDITION.BL_MASK_BUSY]: "Busy",
  // [CONDITION.BL_MASK_ELF_IRON]: "Iron",
  // [CONDITION.BL_MASK_GLOWHANDS]: "Glow",
  // [CONDITION.BL_MASK_GRAB]: "Grab",
  // [CONDITION.BL_MASK_HELD]: "Held",
  // [CONDITION.BL_MASK_ICY]: "Icy",
  // [CONDITION.BL_MASK_INLAVA]: "Lava",
  // [CONDITION.BL_MASK_TETHERED]: "Teth",
  // [CONDITION.BL_MASK_TRAPPED]: "Trap",
  // [CONDITION.BL_MASK_UNCONSC]: "Out",
  // [CONDITION.BL_MASK_WOUNDEDL]: "Legs",
  // [CONDITION.BL_MASK_HOLDING]: "Uhold",
  // [CONDITION.BL_MASK_SLIPPERY]: "Slip",
  // [CONDITION.BL_MASK_PARLYZ]: "Parlyz",
  // [CONDITION.BL_MASK_SLEEPING]: "Zzz",
  // [CONDITION.BL_MASK_SUBMERGED]: "Sub",
};
