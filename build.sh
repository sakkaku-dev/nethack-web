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

	make install PREFIX="$MYDIR/build"
	rm $MYDIR/build/nethack/nethack
	rm $MYDIR/build/nethack/recover
	cp $MYDIR/src/nethackrc.default $MYDIR/build/nethack/
popd
}

stage2() {
pushd NetHack/src
	touch allmain.c
	make PREFIX="$MYDIR/build"
# pushd build
	# cp ../NetHack/src/nethack out.js
	# emcc out.js \
	# 	-O3 \
	# 	-Oz \
	# 	-o nethack.js \
	# 	-s ASYNCIFY \
	# 	--memory-init-file 1 \
	# 	--js-library ../src/nethack_lib.js \
	# 	--preload-file nethack
popd
}

stage2