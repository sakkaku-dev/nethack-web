// @ts-ignore
import nethackLib from "../lib/nethack";
import { NetHackGodot, NetHackJS } from "./models";

import { NetHackWrapper } from "./nethack-wrapper";

declare global {
  interface Window {
    nethackCallback: any;

    nethackJS: NetHackJS;
    nethackGodot: NetHackGodot;

    nethackGlobal: {
      helpers: Record<string, Function>;
    };

    // For debugging
    windows: any;
  }
}

const wrapper = new NetHackWrapper(true);
const godot = window.nethackGodot;

wrapper.onSingleMenu$.subscribe(({ prompt, items }) => godot.openMenuOne(prompt || "", ...items));
wrapper.onMultiMenu$.subscribe(({ prompt, items }) => godot.openMenuAny(prompt || "", ...items));
wrapper.onQuestion$.subscribe(({ question, choices }) => godot.openQuestion(question, ...choices));
wrapper.onDialog$.subscribe(godot.openDialog);

wrapper.onPrint$.subscribe(godot.printLine);
wrapper.onCursorMove$.subscribe(({ x, y }) => godot.moveCursor(x, y));
wrapper.onMapCenter$.subscribe(({ x, y }) => godot.centerView(x, y));

wrapper.onMapUpdate$.subscribe((tiles) => godot.updateMap(...tiles));
wrapper.onStatusUpdate$.subscribe((status) => godot.updateStatus(status));
wrapper.onInventoryUpdate$.subscribe((items) => godot.updateInventory(...items));

window.nethackJS = wrapper;
window.nethackCallback = wrapper.handle.bind(wrapper);

const Module: any = {
  onRuntimeInitialized: () => {
    Module.ccall("shim_graphics_set_callback", null, ["string"], ["nethackCallback"], {
      async: true,
    });
  },
};

nethackLib(Module);
