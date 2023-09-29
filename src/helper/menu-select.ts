import { MENU_SELECT } from '../generated';
import { Item } from '../models';
import { AccelIterator } from './accel-iterator';

export const EMPTY_ITEM: Item = {
    tile: 0,
    groupAcc: 0,
    attr: 0,
    accelerator: 0,
    str: '',
    identifier: 0,
    active: false,
};

export function setAccelerators(items: Item[], accel: AccelIterator) {
    accel.reset();

    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.identifier !== 0) {
            if (item.accelerator === 0) {
                item.accelerator = accel.next();
            }
        } else if (i < items.length - 1) {
            const nextItem = items[i + 1];
            if (nextItem.groupAcc) {
                item.accelerator = nextItem.groupAcc;
            }
        }
    }
}

export function clearMenuItems(items: Item[]) {
    items.forEach((i) => (i.active = false));
}

const SELECT_ALL = '.'.charCodeAt(0);
const DESELECT_ALL = '-'.charCodeAt(0);
const TOGGLE_ALL = '@'.charCodeAt(0);

export function toggleMenuItems(accelOrId: number | string, count: number, menuSelect: MENU_SELECT, items: Item[]) {
    const selectable = items.filter((i) => i.identifier !== 0);

    let selected = selectable.findIndex((i) => typeof accelOrId === 'string' && i.identifier == parseInt(accelOrId));
    if (selected === -1) {
        selected = selectable.findIndex((i) => i.accelerator === accelOrId);
    }

    if (selected !== -1) {
        if (menuSelect === MENU_SELECT.PICK_ONE) {
            clearMenuItems(selectable);
        }

        const item = selectable[selected];

        let c: number | undefined = count;
        if (count === 0 || isNaN(count)) {
            c = undefined;
        }

        item.active = !item.active;
        item.count = c
    } else {
        const groups = selectable.filter((i) => i.groupAcc !== 0 && i.groupAcc === accelOrId);
        const enable = groups.some((i) => !i.active);
        groups.forEach((i) => (i.active = enable));

        if (groups.length === 0) {
            switch (accelOrId) {
                case SELECT_ALL:
                    selectable.forEach((i) => (i.active = true));
                    break;
                case DESELECT_ALL:
                    selectable.forEach((i) => (i.active = false));
                    break;
                case TOGGLE_ALL:
                    const toggleEnable = selectable.some((i) => !i.active);
                    selectable.forEach((i) => (i.active = toggleEnable));
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
