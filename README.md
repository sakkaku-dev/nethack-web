## Nethack port in godot

### Build

Build NetHack for WASM by following steps in `Cross-compiling`.

Emscripten should be installed. I needed the patch in `lib/fixes.diff`. Current build is from `db90e7907`

Example:

- `pushd sys/unix && ./setup.sh hints/linux.370 && popd`
- `make fetch-lua`
- `make CROSS_TO_WASM=1`

### Deploy

Godot needs specific headers from the web server

Apache:

```
Header set Cross-Origin-Opener-Policy "same-origin"
Header set Cross-Origin-Embedder-Policy "require-corp"
```
