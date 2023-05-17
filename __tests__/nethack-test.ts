import { firstValueFrom } from "rxjs";
import { NetHackWrapper } from "../src/nethack-wrapper";

describe("Nethack", () => {
  const setupWrapper = () => {
    const Module: any = {};
    Module.onRuntimeInitialized = () => {
      Module.ccall("shim_graphics_set_callback", null, ["string"], ["nethackCallback"], {
        async: true,
      });
    };
    const wrapper = new NetHackWrapper(true, Module, globalThis as any);
    return wrapper;
  };

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
