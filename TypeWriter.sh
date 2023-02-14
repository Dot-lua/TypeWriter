#!/bin/zsh
cd ./TypeWriter/
pkg -t node18-mac-x64 -o ../TestRuntime/TypeWriter ./
cd ..

./TestRuntime/TypeWriter "$@"