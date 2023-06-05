/**
 * Generate TypeScript enums of the NetHack constants.
 */

const path = require('path');
const fs = require('fs');
const nethack = require(path.join(__dirname, '../lib/nethack'));

const output = path.join(__dirname, '../src/generated.ts');

globalThis.nethackCallback = async function (cmd, ...args) {
    switch (cmd) {
        case 'shim_yn_function':
        case 'shim_message_menu':
            return 121; // return 'y' to all questions
        case 'shim_nhgetch':
        case 'shim_nh_poskey':
            return 0; // simulates a mouse click on "exit up the stairs"
        case 'shim_getmsghistory': // this expects a string
            return '';
        default:
            return 0;
    }
};
globalThis.nethackJS = {
    handle: () => {},
};

async function init() {
    const x = {};
    x.onRuntimeInitialized = function (...args) {
        x.ccall(
            'shim_graphics_set_callback', // C function name
            null, // return type
            ['string'], // arg types
            ['nethackCallback'], // arg values
            { async: true } // options
        );
    };
    await nethack(x); // Need to run this to initialize the constants
}

function generate() {
    let content = '// This is a generated file. Do not edit.\n\n';
    const value = globalThis.nethackGlobal.constants;

    Object.keys(value).forEach((key) => {
        console.log('Generate enum for', key);
        content += `export enum ${key} {\n`;
        Object.keys(value[key])
            .filter((k) => isNaN(parseInt(k)))
            .forEach((subkey) => {
                v = value[key][subkey];
                if (typeof v === 'string') {
                    v = `"${v.trim()}"`;
                }
                content += `    ${subkey} = ${v},\n`;
            });
        content += '}\n\n';
    });

    fs.writeFile(output, content, (err) => {
        if (err) {
            console.error(err);
        }
    });
}

init().then(() => {
    generate();
});
