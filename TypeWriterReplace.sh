#!/bin/zsh
cd ./TypeWriter/
export TYPEWRITER_LOGLEVEL=3
pkg -t node18-mac-x64 -o ../TestRuntime/TypeWriter ./ --public --public-packages --no-bytecode --no-native-build
cd ..
cp ./TestRuntime/TypeWriter ~/.TypeWriter/typewriter