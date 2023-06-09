# Nethack port for Web

Nethack for the web using godot as the UI. (maybe in the future, Godot 4 Web support is not good right now)

## Build

Current build is from `NetHack-3.6.7_Released (ed600d9f0)`

Install Emscripten `v2.0.34 (0d24418f0eac4828f096ee070dae8472d427edaa)` and activate

```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
git pull
./emsdk install 2.0.34
./emsdk activate 2.0.34
source ./emsdk_env.sh
```
 
For NetHack 3.6: (might need to uncomment `make spotless`, if you want a clean install)

-   apply changes of `lib/fixes36.diff` in the `NetHack` submodule.
-   run `build.sh` stage1: it should create the folder `build/nethack` with some files in it. These are the required data files for the actual build.
-   run `build.sh` stage2: actual build of the game. It will update `lib/nethack.*`
-   build the UI with `npm run build:web`
-   copy content of `build` to a web server

### Fixes 3.6

Required changes to make Nethack 3.6

-   Changes all util programs to `.js` and use node to run it
-   Mount files to util programs with `mount_nodefs.js` since it's required to run them (see `UTIL_CFLAGS`)
-   Added new win type `WEB_GRAPHICS` for `win/web` + some config changes?

## Generate

To run `tools/generate.js`, remove `type: module` from `package.json`. To lazy to find a solution for it.

## Deploy (for godot version, not necessary right now)

Godot needs specific headers from the web server

Apache:

```
Header set Cross-Origin-Opener-Policy "same-origin"
Header set Cross-Origin-Embedder-Policy "require-corp"
```

## Assets

-   `nethack_default.png` - https://nethackwiki.com/wiki/File:3.6.1tiles32.png
-   `Nevanda.png` -  https://nethackwiki.com/mediawiki/images/2/26/Nevanda.png
-   `dawnhack_32.bmp` - https://www.deviantart.com/dragondeplatino/art/DawnHack-NetHack-3-6-1-UnNetHack-5-1-0-416312313
-   `Chozo32-360.png` -  https://nethackwiki.com/wiki/File:Chozo32-360.png

## References

-   https://github.com/coolwanglu/BrowserHack (3.4)
-   https://github.com/apowers313/NetHackJS (> 3.7)
