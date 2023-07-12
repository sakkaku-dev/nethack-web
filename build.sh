#/bin/sh

# TODO: Activate emscripten 2.0.34

# Following most steps from BrowserHack build.sh
MYDIR="$(pwd)"
PREFIX="$MYDIR/build"

# These workarounds should not be needed once we upgrade to 3.7
# Just need to get it to work

# This just generated the build/nethack folder with required data files
stage1() {
sed -e '/"type":/d' -i package.json

pushd NetHack
	pushd sys/unix
		# comment out emscripten specific flags
		sed -e '/--preload-file/ s/^#*/#/' -i hints/linux
		sed -e '/EXPORTED_/ s/^#*/#/' -i hints/linux
		sed -e '/ASYNCIFY/ s/^#*/#/' -i hints/linux
		sed -e '/MODULARIZE/ s/^#*/#/' -i hints/linux

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

	# make # check if really needed
	# echo "Prepare nethack"

	# Build dat files, added with --preload-file in stage 2
	make install PREFIX=$PREFIX
	rm $PREFIX/nethack/nethack
	rm $PREFIX/nethack/recover
	echo "Built data files in $PREFIX"
popd
sed -e '/"description":/a \ \ \ \ "type": "module",' -i package.json
}

# Mostly repeating the same steps as for stage1 for generating main game
stage2() {
sed -e '/"type":/d' -i package.json
pushd NetHack/src
	pushd ../sys/unix
		# comment out emscripten specific flags
		sed -e '/--preload-file/ s/^#*/#/' -i hints/linux
		sed -e '/EXPORTED_/ s/^#*/#/' -i hints/linux
		sed -e '/ASYNCIFY/ s/^#*/#/' -i hints/linux
		sed -e '/MODULARIZE/ s/^#*/#/' -i hints/linux

		./setup.sh hints/linux
	popd
	echo "Setup Makefile for unix"

	# make spotless
	pushd ../util
		make PREFIX=""
		# Needed for tilemap compilation
		make ../include/pm.h
		make ../include/onames.h
	popd

	pushd ../win/share
		gcc tilemap.c -I ../../include -DWEB_GRAPHICS -DNOTTYPGRAPHICS -o ../tilemap.o && cd ../ && ./tilemap.o
	popd
	echo "Built tile.c"

	pushd ../sys/unix
		# enable emscripten specific flags again
		sed -e '/--preload-file/s/^#//g' -i hints/linux
		sed -e '/EXPORTED_/s/^#//g' -i hints/linux
		sed -e '/ASYNCIFY/ s/^#//g' -i hints/linux
		sed -e '/MODULARIZE/ s/^#//g' -i hints/linux

		./setup.sh hints/linux
	popd

	make PREFIX="" DATA_DIR="$PREFIX"

	cp nethack $MYDIR/lib/nethack.js
	cp nethack.wasm $MYDIR/lib/nethack.wasm
	cp nethack.data $MYDIR/lib/nethack.data
popd
sed -e '/"description":/a \ \ \ \ "type": "module",' -i package.json
}


# Change which stage to run
# stage1
stage2
