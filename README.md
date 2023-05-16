# Nethack port for Web

Nethack for the web using godot as the UI. (maybe in the future, Godot 4 Web support is not good right now)

## Build

Build NetHack for WASM by following steps in `Cross-compiling`.
Emscripten should be installed. I needed the patch in `lib/fixes.diff`.

Current build is from `NetHack-3.6.7_Released (ed600d9f0)` and
using emscripten `v2.0.34 (0d24418f0eac4828f096ee070dae8472d427edaa)`

For NetHack 3.6: (might need to uncomment `make spotless`, if you want a clean install)

- apply changes of `lib/fixes36.diff` in the `NetHack` submodule.
- run `build.sh` stage1: it should create the folder `build/nethack` with some files in it. These are the required data files for the actual build.
- run `build.sh` stage2: actual build of the game. It will update `lib/nethack.*`
- build the UI with `npm run build:web`

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
