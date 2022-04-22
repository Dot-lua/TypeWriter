echo "Getting ready for download..."

sleep 1

echo "Downloading"
curl -o DotterTemplate.zip -L "https://github.com/Dot-lua/Dua-Template/archive/refs/heads/main.zip"
sleep 1

echo "Unpacking"

unzip ./DotterTemplate

echo "Removing ZIP"
rm ./DotterTemplate.zip

echo "Renaming Dua-Template-main to Project-Template"
mv "./Dua-Template-main" "./Project-Template"

echo "Creating src folder"
mv "./Project-Template/src" "./src"

echo "Cleaning..."
rm -r "./Project-Template"

sleep 1
echo "Done!"