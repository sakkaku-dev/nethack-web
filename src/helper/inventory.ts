import { BUCState, InventoryItem, Item } from "../models";

// From BrowserHack
const activeRegex =
  /\((wielded( in other hand)?|in quiver|weapon in hands?|being worn|on (left|right) (hand|foreclaw|paw|pectoral fin))\)/;

export function toInventoryItem(item: Item): InventoryItem {
  // parse count
  let description = item.str;
  let r = description.split(/^(a|an|\d+)\s+/);

  let count = 1;
  if (r.length == 3) {
    description = r[2];
    count = parseInt(r[1]) || 1;
  }

  let buc = null;
  r = description.split(/^(blessed|uncursed|cursed)\s+/);
  if (r.length == 3) {
    description = r[2];
    buc = r[1] as BUCState;
  }

  return {
	...item,
	active: activeRegex.test(item.str),
    count,
	buc,
    description,
  };
};
