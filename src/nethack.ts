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
  Module.ccall("shim_graphics_set_callback", null, ["string"], ["nethackCallback"], {
    async: true,
  });
};
Module.preRun = [
  () => {
    // Module.ENV["USER"] = "web_user"; // TODO: get name
    Module.ENV.NETHACKOPTIONS = options.join(",");
    Module.noExitRuntime = false;

    try { Module.FS.mkdir('/nethack/save'); } catch (e) { }
    Module.FS.mount(Module.IDBFS, {}, '/nethack/save');
    Module.FS.syncfs(true, (err: any) => {
      if (err) {
        console.warn('Failed to sync FS. Save might not work', err);
      }
    });
  },
];

window.nethackJS = new NetHackWrapper(true, Module);
