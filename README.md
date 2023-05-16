# Nethack port for Web

Nethack for the web using godot as the UI.

## Build

Build NetHack for WASM by following steps in `Cross-compiling`.
Emscripten should be installed. I needed the patch in `lib/fixes.diff`.

Current build is from `NetHack-3.6.7_Released (ed600d9f0)` and
using emscripten `v2.0.34 (0d24418f0eac4828f096ee070dae8472d427edaa)`

Apply changes needed for build, if it still works

- `npm run prepare:nethack` (only once)

`tile.c` has to be generated using `tilemap.c`:

- `npm run build:nethack:tiles`

Build nethack

- `npm run setup:nethack`
- `npm run build:nethack`
- `npm run copy:nethack`

Fix Problems

- `npm run fix:nethack`

Build final application

- `npm run build`

### Fixes 3.6

Required changes to make Nethack 3.6

- Changes all util programs to `.js` and use node to run it
- Mount files to util programs with `mount_nodefs.js` since it's required to run them (see `UTIL_CFLAGS`)
- Added new win type `WEB_GRAPHICS` for `win/web` + some config changes?

## Generate

To run `tools/generate.js`, remove `type: module` from `package.json`. To lazy to find a solution for it.

## Deploy

Godot needs specific headers from the web server

Apache:

```
Header set Cross-Origin-Opener-Policy "same-origin"
Header set Cross-Origin-Embedder-Policy "require-corp"
```
