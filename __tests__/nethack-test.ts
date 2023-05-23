import { firstValueFrom } from "rxjs";
import { NetHackWrapper } from "../src/nethack-wrapper";
import { Command } from "../src/nethack-models";
import { mock } from "jest-mock-extended";
import { NetHackUI } from "../src/models";
import { Status } from "../src/models";

describe("Nethack", () => {
  const WIN_STATUS = 1;
  const WIN_MAP = 2;
  const WIN_INVEN = 3;

  const setupWrapper = () => {
    const Module: any = {};
    Module.onRuntimeInitialized = () => {
      Module.ccall("shim_graphics_set_callback", null, ["string"], ["nethackCallback"], {
        async: true,
      });
    };
    const ui = mock<NetHackUI>();
    const wrapper = new NetHackWrapper(false, Module, {
      ...globalThis,
      nethackUI: ui,
      nethackGlobal: {
        globals: { WIN_STATUS, WIN_INVEN, WIN_MAP },
      },
    } as any);
    return [wrapper, ui] as [NetHackWrapper, NetHackUI];
  };

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const parseStatus = async (line: string) => {
    await wrapper.handle(Command.PUTSTR, WIN_STATUS, 0, line);
    await wait(100);
  };

  let wrapper: NetHackWrapper;
  let ui: NetHackUI;

  beforeEach(() => {
    const [w, u] = setupWrapper();
    wrapper = w;
    ui = u;
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

  // it(
  //   "should work",
  //   async () => {
  //     const wrapper = setupWrapper();
  //     wrapper.startGame();
  //     await firstValueFrom(wrapper.awaitingInput$);

  //     // auto select character
  //     wrapper.sendInput("a".charCodeAt(0));
  //     await firstValueFrom(wrapper.awaitingInput$);

  //     // Close intro dialog
  //     wrapper.sendInput(" ".charCodeAt(0));
  //     await firstValueFrom(wrapper.awaitingInput$);

  //     wrapper.sendInput("?".charCodeAt(0));
  //     const menu = await firstValueFrom(wrapper.onMenu$);

  //     expect(menu.count).toEqual(1);
  //     expect(menu.items.length).toBeGreaterThan(0);
  //   },
  //   10 * 1000
  // );
});
