import { MENU_SELECT } from "../generated";
import { Item } from "../models";

export function clearMenuItems(items: Item[]) {
	items.forEach((i) => (i.active = false));
}

export function toggleMenuItems(accel: number, count: number, items: Item[]) {
	const selected = items.findIndex((i) => i.accelerator !== 0 && i.accelerator === accel);
	if (selected !== -1) {
		if (count === 1) {
			clearMenuItems(items);
		}

		const item = items[selected];
		item.active = !item.active;
	}
}

export function getCountForSelect(select: MENU_SELECT): number {
	if (select === MENU_SELECT.PICK_NONE)
		return 0;
	
	if (select === MENU_SELECT.PICK_ONE)
		return 1;

	return -1;
}