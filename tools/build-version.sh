#!/bin/sh

VERSION=$1
if [ -z $VERSION ]; then
    VERSION="$(git rev-parse HEAD)"
fi

echo "export const VERSION = '$VERSION';" > src/version.ts