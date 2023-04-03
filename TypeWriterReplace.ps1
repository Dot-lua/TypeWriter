cd ./TypeWriter/
pkg -t node18-win-x64 -o ../TestRuntime/TypeWriter.exe ./ --public --public-packages --no-bytecode --no-native-build
cd ..

rm "$env:APPDATA/TypeWriter/TypeWriter.exe"
cp ./TestRuntime/TypeWriter.exe "$env:APPDATA/.TypeWriter/TypeWriter.exe"
