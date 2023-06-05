import { selectItems, toTile } from "./helper/nethack-util";
import { NetHackWrapper } from "./nethack-wrapper";

const options = [
  "showexp",
  "perm_invent",
  "autopickup",
  "pickup_types:$",
  "pickup_thrown",
  "pickup_burden:S",
  "statuscolors",
  "hitpointbar",
  "statushilites:10",
  "hilite_status:characteristics/down/red",
  "hilite_status:characteristics/up/green",
  "hilite_status:hitpoints/<40%/red",
  "hilite_status:hunger/always/red&bold",
  "hilite_status:carrying-capacity/burdened/yellow/stressed/orange",
  "hilite_status:condition/all/bold/major_troubles/red/minor_troubles/orange",
  "autoopen",
  "!cmdassist",
  "sortloot:full",
  "time",
];

const Module: any = {};
Module.onRuntimeInitialized = () => {
  Module.ccall("shim_graphics_set_callback", null, ["string"], ["nethackCallback"], {
    async: true,
  });
};
Module.preRun = [
  () => {
    Module.ENV["USER"] = "player"; // Nethack only asks for a name if the default one is generic like 'player'
    Module.ENV.NETHACKOPTIONS = options.join(",");
  },
];

window.module = Module;
window.nethackJS = new NetHackWrapper(true, Module, { selectItems, toTile });
