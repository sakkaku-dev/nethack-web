import { MENU_SELECT } from '../src/generated';
import { EMPTY_ITEM, toggleMenuItems } from '../src/helper/menu-select';
import { Item } from '../src/models';

describe('MenuSelect', () => {
    const code = (c: string) => c.charCodeAt(0);

    it('should select single menu item', () => {
        const items = [
            { ...EMPTY_ITEM, identifier: 1, accelerator: code('a'), active: false },
            { ...EMPTY_ITEM, identifier: 1, accelerator: code('b'), active: false },
        ];
        toggleMenuItems(code('a'), -1, 1, items);
        expect(items.map((i) => i.active)).toEqual([true, false]);

        toggleMenuItems(code('b'), -1, 1, items);
        expect(items.map((i) => i.active)).toEqual([false, true]);
    });

    it('should select multiple menu item', () => {
        const items = [
            { ...EMPTY_ITEM, identifier: 1, accelerator: code('a'), active: false },
            { ...EMPTY_ITEM, identifier: 1, accelerator: code('b'), active: false },
        ];
        toggleMenuItems(code('a'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([true, false]);

        toggleMenuItems(code('b'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([true, true]);

        toggleMenuItems(code('a'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([false, true]);
    });

    it('should select by group accel', () => {
        const items: Item[] = [
            { ...EMPTY_ITEM, identifier: 0, accelerator: code('%'), active: false },
            { ...EMPTY_ITEM, identifier: 1, groupAcc: code('%'), accelerator: code('a'), active: false },
            { ...EMPTY_ITEM, identifier: 2, groupAcc: code('%'), accelerator: code('b'), active: false },
        ];
        toggleMenuItems(code('%'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([false, true, true]);

        toggleMenuItems(code('%'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([false, false, false]);

        toggleMenuItems(code('b'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([false, false, true]);

        toggleMenuItems(code('%'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([false, true, true]);
    });

    it('should select all', () => {
        const items: Item[] = [
            { ...EMPTY_ITEM, identifier: 1, accelerator: code('a'), active: false },
            { ...EMPTY_ITEM, identifier: 1, accelerator: code('b'), active: false },
        ];
        toggleMenuItems(code('.'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([true, true]);

        toggleMenuItems(code('.'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([true, true]);
    });

    it('should deselect all', () => {
        const items: Item[] = [
            { ...EMPTY_ITEM, identifier: 1, accelerator: code('a'), active: false },
            { ...EMPTY_ITEM, identifier: 1, accelerator: code('b'), active: false },
        ];
        toggleMenuItems(code('.'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([true, true]);

        toggleMenuItems(code('-'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([false, false]);
    });

    it('should toggle all', () => {
        const items: Item[] = [
            { ...EMPTY_ITEM, identifier: 1, accelerator: code('a'), active: false },
            { ...EMPTY_ITEM, identifier: 1, accelerator: code('b'), active: false },
        ];
        toggleMenuItems(code('@'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([true, true]);

        toggleMenuItems(code('@'), -1, MENU_SELECT.PICK_ANY, items);
        expect(items.map((i) => i.active)).toEqual([false, false]);
    });

    it('should select by identifier', () => {
        const items = [
            { ...EMPTY_ITEM, identifier: 5, accelerator: code('a'), active: false },
            { ...EMPTY_ITEM, identifier: 10, accelerator: code('b'), active: false },
        ];
        toggleMenuItems('10', -1, 1, items);
        expect(items.map((i) => i.active)).toEqual([false, true]);
    });
});
