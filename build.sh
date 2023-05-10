#/bin/sh

# TODO: Activate emscripten 2.0.34

# Following most steps from BrowserHack build.sh
MYDIR="$(pwd)"
PREFIX="$MYDIR/build"

# These workarounds should not be needed once we upgrade to 3.7
# Just need to get it to work

stage1() {
# Preparing everything for the final build in stage2
sed -e '/"type":/d' -i package.json
npm run setup:nethack

pushd NetHack
	pushd sys/unix
		# comment out emscripten specific flags
		sed -e '/--preload-file/ s/^#*/#/' -i hints/linux
		sed -e '/EXPORTED_/ s/^#*/#/' -i hints/linux
		sed -e '/ASYNCIFY/ s/^#*/#/' -i hints/linux
		sed -e '/MODULARIZE/ s/^#*/#/' -i hints/linux

		sed -e '/PREFIX=\$/ s/^#//g' -i hints/linux
		./setup.sh hints/linux
	popd
	echo "Setup Makefile for unix"

	make spotless

	# Cannot build from the root
	pushd util
		make

		# Needed for tilemap compilation
		make ../include/pm.h
		make ../include/onames.h
	popd
	echo "Built util"

	# Does not get build during make?
	pushd win/share
		gcc tilemap.c -I ../../include -o ../tilemap.o && cd ../ && ./tilemap.o
	popd
	echo "Built tile.c"

	make # check if really needed
	echo "Prepare nethack" 

	# Build dat files, added with --preload-file
	make install PREFIX=$PREFIX
	rm $MYDIR/build/nethack/nethack
	rm $MYDIR/build/nethack/recover
	cp $MYDIR/src/nethackrc.default $MYDIR/build/nethack/
	echo "Built data files in $PREFIX"
popd
sed -e '/"description":/a \ \ "type": "module",' -i package.json
}

stage2() {
sed -e '/"type":/d' -i package.json
pushd NetHack/src
	pushd ../sys/unix
		# enable emscripten specific flags again
		sed -e '/--preload-file/s/^#//g' -i hints/linux
		sed -e '/EXPORTED_/s/^#//g' -i hints/linux
		sed -e '/ASYNCIFY/ s/^#//g' -i hints/linux
		sed -e '/MODULARIZE/ s/^#//g' -i hints/linux

		sed -e '/PREFIX=\$/ s/^#*/#/' -i hints/linux
		./setup.sh hints/linux
	popd

	touch allmain.c
	make BUILD_DIR="$MYDIR/build" HACKDIR=/

	cp nethack $MYDIR/lib/nethack.js
	cp nethack.wasm $MYDIR/lib/nethack.wasm
	cp nethack.data $MYDIR/lib/nethack.data
popd
sed -e '/"description":/a \ \ "type": "module",' -i package.json
}

stage2