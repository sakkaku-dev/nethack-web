import { selectItems, toTile } from './helper/nethack-util';
import { NetHackWrapper } from './nethack-wrapper';

const Module: any = {};
Module.onRuntimeInitialized = () => {
    Module.ccall('shim_graphics_set_callback', null, ['string'], ['nethackCallback'], {
        async: true,
    });
};
Module.preRun = [
    () => {
        Module.ENV['USER'] = 'player'; // Nethack only asks for a name if the default one is generic like 'player'
        // Module.ENV.NETHACKOPTIONS = options.join(',');
    },
];

window.module = Module;
window.nethackJS = new NetHackWrapper(true, Module, { selectItems, toTile });
