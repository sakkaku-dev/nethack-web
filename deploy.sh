#!/bin/sh

godot --export-debug Web

npm run build
cp lib/nethack.wasm build

sudo mkdir -p /srv/http/nethack
sudo cp build/* /srv/http/nethack