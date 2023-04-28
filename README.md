## Nethack port for Web

Nethack for the web using godot as the UI.

### Build

Build NetHack for WASM by following steps in `Cross-compiling`.
Emscripten should be installed. I needed the patch in `lib/fixes.diff`.

Current build is from `db90e7907` and using emscripten v3.1.34 (57b21b8fdcbe3ebb523178b79465254668eab408)

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

### Generate

To run `tools/generate.js`, remove `type: module` from `package.json`. To lazy to find a solution for it.

### Deploy

Godot needs specific headers from the web server

Apache:

```
Header set Cross-Origin-Opener-Policy "same-origin"
Header set Cross-Origin-Embedder-Policy "require-corp"
```
