#!/bin/zsh
mkdir ./.build/
cd ./TypeWriter/
pkg -t "node18-alpine-x64,node18-alpine-arm64,node18-linux-x64,node18-linux-arm64,node18-linuxstatic-x64,node18-linuxstatic-arm64,node18-win-x64,node18-win-arm64,node18-macos-arm64,node18-macos-x64" --out-path ../.build/ ./ 
cd ..