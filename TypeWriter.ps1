cd ./TypeWriter/
pkg -t node18-win-x64 -o ../TestRuntime/TypeWriter.exe ./ --public --public-packages --no-bytecode --no-native-build
cd ..

powershell -Command { $env:TYPEWRITER_LOGLEVEL = 3; ./TestRuntime/TypeWriter.exe $args } -args $args
