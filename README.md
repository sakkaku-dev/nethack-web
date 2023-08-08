# Nethack port for Web

Nethack for the web

## Build

See [release.yml](./.github/workflows/release.yml) workflow for exact steps.

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
 
### Fixes 3.6

Summary of the changes in `lib/fixes36.diff` to make Nethack 3.6 (most will not be needed anymore for 3.7 release)

-   Changes all util programs to `.js` and use node to run it
-   Mount files to util programs with `mount_nodefs.js` since it's required to run them (see `UTIL_CFLAGS`)
-   Added new win type `WEB_GRAPHICS` for `win/web` + some config changes?
-   Enable wizard mode in `unixmain.c#authorize_wizard_mode`

## Generate

To run `tools/generate.js`, remove `type: module` from `package.json`. To lazy to find a solution for it.

## Assets

-   `nethack_default.png` - https://nethackwiki.com/wiki/File:3.6.1tiles32.png
-   `Nevanda.png` -  https://nethackwiki.com/mediawiki/images/2/26/Nevanda.png
-   `dawnhack_32.bmp` - https://www.deviantart.com/dragondeplatino/art/DawnHack-NetHack-3-6-1-UnNetHack-5-1-0-416312313
-   `Chozo32-360.png` -  https://nethackwiki.com/wiki/File:Chozo32-360.png

## References

-   https://github.com/coolwanglu/BrowserHack (3.4)
-   https://github.com/apowers313/NetHackJS (> 3.7)
