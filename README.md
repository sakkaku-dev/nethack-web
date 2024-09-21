# Nethack port for Web

Nethack for the web

## Build

See [build.yml](./.github/workflows/build.yml) workflow for exact steps.

Current build is from `NetHack-3.6.7_Released (ed600d9f0)`

Install Emscripten `v2.0.34 (0d24418f0eac4828f096ee070dae8472d427edaa)` and activate.
NodeJS v16 is required to fix ERR_INVALID_URL error

```
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
git pull
./emsdk install 2.0.34
./emsdk install node-16.20.0-64bit
./emsdk activate 2.0.34
./emsdk activate node-16.20.0-64bit
source ./emsdk_env.sh
```
 
### Fixes 3.6

Summary of the changes in `lib/fixes36.diff` to make Nethack 3.6 (most will not be needed anymore for 3.7 release)

-   Changes all util programs to `.js` and use node to run it (only 3.6)
-   Mount files to util programs with `mount_nodefs.js` since it's required to run them (see `UTIL_CFLAGS`) (only 3.6)
-   Added new win type `WEB_GRAPHICS` for `win/web` + some config changes? (mostly from NetHackJS + BrowserHack)
	- Added player selection
	- Added rogue level flag
	- Separate JS callbacks for some calls to improve performance (Asyncify make calls too slow)
-   Enable wizard mode in `unixmain.c#authorize_wizard_mode`
-	Move `iflags.suppress_price--;` above inventory update in `shk.c` (only 3.6)

## Generate

To run `tools/generate.js`, remove `type: module` from `package.json`. To lazy to find a solution for it.

## Assets

-   `nethack_default.png` - https://nethackwiki.com/wiki/File:3.6.1tiles32.png
-   `Nevanda.png` -  https://nethackwiki.com/mediawiki/images/2/26/Nevanda.png
-   `dawnhack_32.bmp` - https://www.deviantart.com/dragondeplatino/art/DawnHack-NetHack-3-6-1-UnNetHack-5-1-0-416312313
-   `Chozo32-360.png` -  https://nethackwiki.com/wiki/File:Chozo32-360.png
-	Sound effects from https://www.reddit.com/r/nethack/comments/16rcdxz/yhacsib_v02_a_continuation_of_the_2004_yhacs/

## References

-   https://github.com/coolwanglu/BrowserHack (3.4)
-   https://github.com/apowers313/NetHackJS (> 3.7)
