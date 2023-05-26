import { firstValueFrom } from "rxjs";
import { NetHackWrapper } from "../src/nethack-wrapper";
import { Command } from "../src/nethack-models";
import { mock } from "jest-mock-extended";
import { Item, NetHackUI } from "../src/models";
import { Status } from "../src/models";
import { NethackUtil } from "../src/helper/nethack-util";
import { MENU_SELECT } from "../src/generated";

describe("Nethack", () => {
  const WIN_STATUS = 1;
  const WIN_MAP = 2;
  const WIN_INVEN = 3;
  const WIN_ANY = 10;

  const ANY_POINTER = 9999;

  const setupWrapper = () => {
    const Module: any = {};
    Module.onRuntimeInitialized = () => {
      Module.ccall("shim_graphics_set_callback", null, ["string"], ["nethackCallback"], {
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

  describe("Status", () => {
    it("should parse stat line", async () => {
      await parseStatus("Web_user the Gallant     St:14 Dx:10 Co:13 In:7 Wi:14 Ch:17  Lawful");
      expect(ui.updateStatus).toBeCalledWith(
        expect.objectContaining({
          title: "the Gallant",
          align: "Lawful",
          str: "14",
          dex: 10,
          con: 13,
          int: 7,
          wis: 14,
          cha: 17,
        } as Status)
      );
    });

    it("should parse special strength value", async () => {
      await parseStatus("Web_user the Gallant     St:18/50 Dx:10 Co:13 In:7 Wi:14 Ch:17  Lawful");
      expect(ui.updateStatus).toBeCalledWith(expect.objectContaining({ str: "18/50" } as Status));
    });

    it("should other line", async () => {
      await parseStatus("Dlvl:1  $:0  HP:16(16) Pw:6(6) AC:3  Exp:1");

      expect(ui.updateStatus).toBeCalledWith(
        expect.objectContaining({
          dungeonLvl: "1",
          gold: 0,
          hp: 16,
          hpMax: 16,
          power: 6,
          powerMax: 6,
          armor: 3,
          expLvl: 1,
        } as Status)
      );
    });

    it("should parse hunger", async () => {
      await parseStatus("Dlvl:1  $:0  HP:16(16) Pw:6(6) AC:3  Exp:1  Hungry  ");
      expect(ui.updateStatus).toBeCalledWith(
        expect.objectContaining({ hunger: "Hungry" } as Status)
      );
    });

    it("should parse negative armor", async () => {
      await parseStatus("Dlvl:1  $:0  HP:16(16) Pw:6(6) AC:-3  Exp:1");
      expect(ui.updateStatus).toBeCalledWith(expect.objectContaining({ armor: -3 } as Status));
    });

    it("should parse time", async () => {
      await parseStatus("Dlvl:1  $:0  HP:16(16) Pw:6(6) AC:-3  Exp:1 T:1250");
      expect(ui.updateStatus).toBeCalledWith(expect.objectContaining({ time: 1250 } as Status));
    });

    it("should parse xp", async () => {
      await parseStatus("Dlvl:1  $:0  HP:16(16) Pw:6(6) AC:-3  Xp:1/5 T:1250");
      expect(ui.updateStatus).toBeCalledWith(
        expect.objectContaining({ expLvl: 1, exp: 5 } as Status)
      );
    });
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

  const item: Item = {
    identifier: 0,
    str: "",
    tile: 0,
    accelerator: 0,
    groupAcc: 0,
    attr: 0,
    active: false,
  };

  const send = async (...chars: (string | number)[]) => {
    wrapper.sendInput(...chars);
    await wait(10);
  };

  describe("Menu", () => {
    it("should pick one menu", async () => {
      const item1: Item = {
        ...item,
        identifier: 1,
        str: "Item 1",
        accelerator: "a".charCodeAt(0),
      };
      const item2: Item = {
        ...item1,
        str: "Item 2",
        identifier: 2,
        accelerator: "b".charCodeAt(0),
      };

      await sendMenu([item1, item2], "Select one");
      wrapper
        .handle(Command.MENU_SELECT, WIN_ANY, MENU_SELECT.PICK_ONE, ANY_POINTER)
        .then((len) => {
          expect(len).toEqual(1);
        });
      expect(ui.openMenu).toBeCalledWith(WIN_ANY, "Select one", 1, item1, item2);

      await send("a");
      expect(ui.openMenu).toBeCalledWith(
        expect.anything(),
        expect.anything(),
        1,
        { ...item1, active: true },
        item2
      );

      expect(util.selectItems).toBeCalledWith([1], ANY_POINTER);
    });

    it("should pick many menu", async () => {
      const item1: Item = {
        ...item,
        identifier: 1,
        str: "Item 1",
        accelerator: "a".charCodeAt(0),
      };
      const item2: Item = {
        ...item1,
        str: "Item 2",
        identifier: 2,
        accelerator: "b".charCodeAt(0),
      };

      await sendMenu([item1, item2], "Select many");
      wrapper
        .handle(Command.MENU_SELECT, WIN_ANY, MENU_SELECT.PICK_ANY, ANY_POINTER)
        .then((len) => {
          expect(len).toEqual(2);
        });
      expect(ui.openMenu).toBeCalledWith(WIN_ANY, "Select many", -1, item1, item2);

      await send("a");
      expect(ui.openMenu).toBeCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        { ...item1, active: true },
        item2
      );

      await send("b");
      expect(ui.openMenu).toBeCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        { ...item1, active: true },
        { ...item2, active: true }
      );

      await send(" ");
      expect(util.selectItems).toBeCalledWith([1, 2], ANY_POINTER);
    });

    it("should cancel menu", async () => {
      const item1: Item = {
        ...item,
        identifier: 1,
        str: "Item 1",
        accelerator: "a".charCodeAt(0),
      };

      await sendMenu([item1], "Select many");
      wrapper
        .handle(Command.MENU_SELECT, WIN_ANY, MENU_SELECT.PICK_ANY, ANY_POINTER)
        .then((len) => {
          expect(len).toEqual(-1);
        });

      await send("a");
      await send(27);
      expect(util.selectItems).not.toBeCalled();
    });
  });
});
