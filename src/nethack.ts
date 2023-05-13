// @ts-ignore
import nethackLib from "../lib/nethack";

import { NetHackWrapper } from "./nethack-wrapper";

const options = [
  "perm_invent",
  "autopickup",
  "pickup_types:$",
  "pickup_thrown",
  "pickup_burden:S",
  "autoopen",
  "!cmdassist",
  "sortloot:full",
];

const Module: any = {};
Module.onRuntimeInitialized = () => {
  Module.ccall(
    "shim_graphics_set_callback",
    null,
    ["string"],
    ["nethackCallback"],
    {
      async: true,
    }
  );
};
Module.preRun = [
  () => {
    // Module.ENV["USER"] = "web_user"; // TODO: get name
    Module.ENV.NETHACKOPTIONS = options.join(",");
  },
];

const wrapper = new NetHackWrapper(true, Module);
const godot = window.nethackGodot;

wrapper.onMenu$.subscribe(({ winid, prompt, count, items }) =>
  godot.openMenu(winid, prompt || "", count, ...items)
);
wrapper.onQuestion$.subscribe(({ question, choices }) =>
  godot.openQuestion(question, ...choices)
);
wrapper.onDialog$.subscribe(({ id, text }) => godot.openDialog(id, text));
wrapper.onCloseDialog$.subscribe((id) => godot.closeDialog(id));

wrapper.onPrint$.subscribe(godot.printLine);
wrapper.onCursorMove$.subscribe(({ x, y }) => godot.moveCursor(x, y));
wrapper.onMapCenter$.subscribe(({ x, y }) => godot.centerView(x, y));

wrapper.onMapUpdate$.subscribe((tiles) => godot.updateMap(...tiles));
wrapper.onStatusUpdate$.subscribe((status) => godot.updateStatus(status));
wrapper.onInventoryUpdate$.subscribe((items) =>
  godot.updateInventory(...items)
);

window.nethackJS = wrapper;
window.nethackCallback = wrapper.handle.bind(wrapper);
(window as any).module = Module;

nethackLib(Module);
