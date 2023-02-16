#!/bin/zsh
cd ./TypeWriter/
pkg -t node18-mac-x64 -o ../TestRuntime/TypeWriter ./ --public --public-packages --no-bytecode --no-native-build
cd ..

./TestRuntime/TypeWriter "$@"