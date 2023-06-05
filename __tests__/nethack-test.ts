import { firstValueFrom } from 'rxjs';
import { NetHackWrapper } from '../src/nethack-wrapper';
import { Command } from '../src/nethack-models';
import { mock } from 'jest-mock-extended';
import { Item, NetHackUI } from '../src/models';
import { Status } from '../src/models';
import { NethackUtil } from '../src/helper/nethack-util';
import { MENU_SELECT } from '../src/generated';
import { EMPTY_ITEM } from '../src/helper/menu-select';
import { ENTER, ESC, SPACE } from '../src/helper/keys';

describe('Nethack', () => {
    const WIN_STATUS = 1;
    const WIN_MAP = 2;
    const WIN_INVEN = 3;
    const WIN_ANY = 10;

    const ANY_POINTER = 9999;

    const setupWrapper = () => {
        const Module: any = {};
        Module.onRuntimeInitialized = () => {
            Module.ccall('shim_graphics_set_callback', null, ['string'], ['nethackCallback'], {
                async: true,
            });
        };
        const ui = mock<NetHackUI>();
        const util = { selectItems: jest.fn(), toTile: (x) => x } as NethackUtil;
        const wrapper = new NetHackWrapper(
            false,
            Module,
            util,
            {
                ...globalThis,
                nethackUI: ui,
                nethackGlobal: {
                    globals: { WIN_STATUS, WIN_INVEN, WIN_MAP },
                },
            } as any,
            false
        );
        return [wrapper, ui, util] as [NetHackWrapper, NetHackUI, NethackUtil];
    };

    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const parseStatus = async (line: string) => {
        await wrapper.handle(Command.PUTSTR, WIN_STATUS, 0, line);
        await wait(200);
    };

    let wrapper: NetHackWrapper;
    let ui: NetHackUI;
    let util: NethackUtil;

    beforeEach(() => {
        const [w, u, ut] = setupWrapper();
        wrapper = w;
        ui = u;
        util = ut;
    });

    const sendMenu = async (items: Item[], prompt: string) => {
        await wrapper.handle(Command.MENU_START);
        items.map((i) => {
            return wrapper.handle(
                Command.MENU_ADD,
                WIN_ANY,
                i.tile,
                i.identifier,
                i.accelerator,
                i.groupAcc,
                i.attr,
                i.str,
                i.active ? 1 : 0
            );
        });
        await wrapper.handle(Command.MENU_END, WIN_ANY, prompt);
    };

    const send = async (...chars: (string | number)[]) => {
        wrapper.sendInput(...chars);
        await wait(10);
    };

    const code = (c: string) => c.charCodeAt(0);

    describe('Menu', () => {
        it('should pick one menu', async () => {
            const item1: Item = {
                ...EMPTY_ITEM,
                identifier: 1,
                str: 'Item 1',
                accelerator: 'a'.charCodeAt(0),
            };
            const item2: Item = {
                ...EMPTY_ITEM,
                str: 'Item 2',
                identifier: 2,
                accelerator: 'b'.charCodeAt(0),
            };

            await sendMenu([item1, item2], 'Select one');
            wrapper.handle(Command.MENU_SELECT, WIN_ANY, MENU_SELECT.PICK_ONE, ANY_POINTER).then((len) => {
                expect(len).toEqual(1);
            });
            expect(ui.openMenu).toBeCalledWith(WIN_ANY, 'Select one', 1, item1, item2);

            await send('a');
            expect(ui.openMenu).toBeCalledWith(
                expect.anything(),
                expect.anything(),
                1,
                { ...item1, active: true },
                item2
            );

            expect(util.selectItems).toBeCalledWith([1], ANY_POINTER);
        });

        it('should pick many menu', async () => {
            const item1: Item = {
                ...EMPTY_ITEM,
                identifier: 1,
                str: 'Item 1',
                accelerator: 'a'.charCodeAt(0),
            };
            const item2: Item = {
                ...item1,
                str: 'Item 2',
                identifier: 2,
                accelerator: 'b'.charCodeAt(0),
            };

            await sendMenu([item1, item2], 'Select many');
            wrapper.handle(Command.MENU_SELECT, WIN_ANY, MENU_SELECT.PICK_ANY, ANY_POINTER).then((len) => {
                expect(len).toEqual(2);
            });
            expect(ui.openMenu).toBeCalledWith(WIN_ANY, 'Select many', -1, item1, item2);

            await send('a');
            expect(ui.openMenu).toBeCalledWith(
                expect.anything(),
                expect.anything(),
                expect.anything(),
                { ...item1, active: true },
                item2
            );

            await send('b');
            expect(ui.openMenu).toBeCalledWith(
                expect.anything(),
                expect.anything(),
                expect.anything(),
                { ...item1, active: true },
                { ...item2, active: true }
            );

            await send(' ');
            expect(util.selectItems).toBeCalledWith([1, 2], ANY_POINTER);
        });

        it('should cancel menu', async () => {
            const item1: Item = {
                ...EMPTY_ITEM,
                identifier: 1,
                str: 'Item 1',
                accelerator: 'a'.charCodeAt(0),
            };

            await sendMenu([item1], 'Select many');
            wrapper.handle(Command.MENU_SELECT, WIN_ANY, MENU_SELECT.PICK_ANY, ANY_POINTER).then((len) => {
                expect(len).toEqual(-1);
            });

            await send('a');
            await send(27);
            expect(util.selectItems).not.toBeCalled();
        });
    });

    describe('YN Question', () => {
        it('should show question', async () => {
            wrapper.handle(Command.YN_FUNCTION, 'Save game?', 'yn', code('n'));
            expect(ui.openQuestion).toBeCalledWith('Save game?', 'n', 'y', 'n');
        });

        it('should get choices from question', async () => {
            wrapper.handle(Command.YN_FUNCTION, 'Save game? [ynaq]', 'yn', code('n'));
            expect(ui.openQuestion).toBeCalledWith('Save game?', 'n', 'y', 'n', 'a', 'q');
        });

        it('should get choices from question with allow all', async () => {
            wrapper.handle(Command.YN_FUNCTION, 'Save game? [a-f or ?*]', 'yn', code('n'));
            expect(ui.openQuestion).toBeCalledWith('Save game?', 'n', 'a-f or ?*');
        });

        it('should allow all choies with only asterix', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game? [*]', '', code('n'));
            send('I');
            await expect(p).resolves.toEqual(code('I'));
        });

        it('should return one of choices', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game?', 'yn', code('n'));
            send('y');
            await expect(p).resolves.toEqual(code('y'));
        });

        it('should wait until valid choices', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game?', 'yn', code('n'));
            await send('a');
            await send('i');
            await send('y');
            await expect(p).resolves.toEqual(code('y'));
        });

        it('should accept ESC as valid choice', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game?', '', code('n'));
            await send(ESC);
            await expect(p).resolves.toEqual(code('n'));
        });

        it('should accept all choices if null', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game?', null, code('n'));
            send('H');
            await expect(p).resolves.toEqual(code('H'));
        });

        it('should accept all choices if empty string', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game?', '', code('n'));
            send('H');
            await expect(p).resolves.toEqual(code('H'));
        });

        it('should map ESC to quit', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game?', 'ynq', code('n'));
            send(ESC);
            await expect(p).resolves.toEqual(code('q'));
        });

        it('should map ESC to no', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game?', 'yn', code('y'));
            send(ESC);
            await expect(p).resolves.toEqual(code('n'));
        });

        it('should map ESC to default', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game?', 'ya', code('y'));
            send(ESC);
            await expect(p).resolves.toEqual(code('y'));
        });

        it('should map SPACE to default', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game?', 'ya', code('y'));
            send(SPACE);
            await expect(p).resolves.toEqual(code('y'));
        });

        it('should map RETURN to default', async () => {
            const p = wrapper.handle(Command.YN_FUNCTION, 'Save game?', 'ya', code('y'));
            send(ENTER);
            await expect(p).resolves.toEqual(code('y'));
        });
    });
});
