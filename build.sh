#/bin/sh

# Following most steps from BrowserHack build.sh
MYDIR="$(pwd)"

stage1() {
pushd NetHack
	pushd sys/unix
		./setup.sh hints/linux
	popd

	make spotless
	make

	# Build dat files, added with --preload-file
	make install PREFIX="$MYDIR/build"
	rm $MYDIR/build/nethack/nethack
	rm $MYDIR/build/nethack/recover
	cp $MYDIR/src/nethackrc.default $MYDIR/build/nethack/
popd
}

stage2() {
pushd NetHack/src
	# touch allmain.c
	make PREFIX="$MYDIR/build"

	cp nethack $MYDIR/lib/nethack.js
	cp nethack.wasm $MYDIR/lib/nethack.wasm
	cp nethack.data $MYDIR/lib/nethack.data
popd
}

stage2