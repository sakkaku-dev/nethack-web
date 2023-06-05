import { toInventoryItem } from '../src/helper/inventory';
import { EMPTY_ITEM } from '../src/helper/menu-select';
import { BUCState } from '../src/models';

describe('Inventory', () => {
    it('should parse active state', () => {
        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'mace (weapon in hand)' }).active).toBeTruthy();
        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'robe (being worn)' }).active).toBeTruthy();
        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'elven arrows (in quiver)' }).active).toBeTruthy();
        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'quarterstaff (weapon in hands)' }).active).toBeTruthy();
        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'ring of adornment (on left hand)' }).active).toBeTruthy();

        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'elven bow (alternate weapon; not wielded)' }).active).toBeFalsy();
        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'darts (at the ready)' }).active).toBeFalsy();
    });

    it('should parse count', () => {
        expect(toInventoryItem({ ...EMPTY_ITEM, str: '21 +2 darts (at the ready)' }).count).toEqual(21);
        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'an uncursed credit card' }).count).toEqual(1);
        expect(toInventoryItem({ ...EMPTY_ITEM, str: '2 uncursed slime molds' }).count).toEqual(2);
    });

    it('should parse buc state', () => {
        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'a blessed potion of extra healing' }).buc).toEqual(
            BUCState.BLESSED
        );
        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'a uncursed potion of extra healing' }).buc).toEqual(
            BUCState.UNCURSED
        );
        expect(toInventoryItem({ ...EMPTY_ITEM, str: 'a cursed potion of extra healing' }).buc).toEqual(
            BUCState.CURSED
        );
    });
});
