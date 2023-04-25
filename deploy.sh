#!/bin/sh

npm run build
sudo mkdir -p /srv/http/nethack
sudo cp build/* /srv/http/nethack