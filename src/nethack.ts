// @ts-ignore
import nethackLib from "../lib/nethack";

import { NetHackWrapper } from "./nethack-wrapper";

const Module: any = {};
Module.onRuntimeInitialized = () => {
  Module.ccall("shim_graphics_set_callback", null, ["string"], ["nethackCallback"], {
    async: true,
  });
};
Module.preRun = [
  () => {
    // Module.ENV["USER"] = "web_user"; // TODO: get name
  },
];

// const wrapper = new NetHackWrapper(true, Module);
// const godot = window.nethackGodot;

// wrapper.onMenu$.subscribe(({ winid, prompt, count, items }) =>
//   godot.openMenu(winid, prompt || "", count, ...items)
// );
// wrapper.onQuestion$.subscribe(({ question, choices }) =>
//   godot.openQuestion(question, ...choices)
// );
// wrapper.onDialog$.subscribe(({ id, text }) => godot.openDialog(id, text));
// wrapper.onCloseDialog$.subscribe((id) => godot.closeDialog(id));

// wrapper.onPrint$.subscribe(godot.printLine);
// wrapper.onCursorMove$.subscribe(({ x, y }) => godot.moveCursor(x, y));
// wrapper.onMapCenter$.subscribe(({ x, y }) => godot.centerView(x, y));

// wrapper.onMapUpdate$.subscribe((tiles) => godot.updateMap(...tiles));
// wrapper.onStatusUpdate$.subscribe((status) => godot.updateStatus(status));
// wrapper.onInventoryUpdate$.subscribe((items) =>
//   godot.updateInventory(...items)
// );

// window.nethackJS = wrapper;

let winCount = 0;
async function doGraphics(name: string, ...args: string[]) {
  console.log(`shim graphics: ${name} [${args}]`);

  switch (name) {
    case "shim_create_nhwindow":
      winCount++;
      console.log("creating window", args, "returning", winCount);
      return winCount;
    case "shim_yn_function":
    case "shim_message_menu":
      return 121; // return 'y' to all questions
    case "shim_nhgetch":
    case "shim_nh_poskey":
      return 0; // simulates a mouse click on "exit up the stairs"
    case "shim_getmsghistory":
      return "";
    default:
      return 0;
  }
}

window.nethackCallback = doGraphics;

nethackLib(Module);
