import { MENU_SELECT } from "../generated";
import { Item } from "../models";

export const EMPTY_ITEM: Item = {
  tile: 0,
  groupAcc: 0,
  attr: 0,
  accelerator: 0,
  str: "",
  identifier: 0,
  active: false,
};

export function clearMenuItems(items: Item[]) {
  items.forEach((i) => (i.active = false));
}

const SELECT_ALL = '.'.charCodeAt(0);
const DESELECT_ALL = '-'.charCodeAt(0);
const TOGGLE_ALL = '@'.charCodeAt(0);

export function toggleMenuItems(accel: number, count: number, items: Item[]) {
  const selectable = items.filter(i => i.accelerator !== 0);
  const selected = selectable.findIndex((i) => i.accelerator === accel);
  if (selected !== -1) {
    if (count === 1) {
      clearMenuItems(selectable);
    }

    const item = selectable[selected];
    item.active = !item.active;
  } else if (count === -1) {
    const groups = selectable.filter(i => i.groupAcc !== 0 && i.groupAcc === accel);
    const enable = groups.some(i => !i.active);
    groups.forEach(i => i.active = enable);

    if (groups.length === 0) {
      switch(accel) {
        case SELECT_ALL:
          selectable.forEach(i => i.active = true);
          break;
        case DESELECT_ALL:
          selectable.forEach(i => i.active = false);
          break;
        case TOGGLE_ALL:
          const toggleEnable = selectable.some(i => !i.active);
          selectable.forEach(i => i.active = toggleEnable);
          break;
      }
    }
  }
}

export function getCountForSelect(select: MENU_SELECT): number {
  if (select === MENU_SELECT.PICK_NONE) return 0;

  if (select === MENU_SELECT.PICK_ONE) return 1;

  return -1;
}
