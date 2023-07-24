#!/bin/sh

VERSION=$(git rev-parse HEAD)
echo "export const VERSION = '$VERSION';" > src/version.ts