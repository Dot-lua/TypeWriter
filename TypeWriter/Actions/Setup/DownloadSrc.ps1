Write-Output "Getting ready for download..."

Start-Sleep 1

Write-Output "Downloading"
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -O DotterTemplate.zip "https://github.com/Dot-lua/Dua-Template/archive/refs/heads/main.zip"
$ProgressPreference = 'Continue'
Start-Sleep 1

Write-Output "Unpacking"

Expand-Archive -LiteralPath ./DotterTemplate.Zip -DestinationPath ./

Write-Output "Removing ZIP"
Remove-Item DotterTemplate.zip

Write-Output "Renaming Dua-Template-main to Project-Template"
Move-Item "./Dua-Template-main" Project-Template

Write-Output "Creating src folder"
Move-Item "./Project-Template/src" "./src"

Write-Output "Cleaning..."
Remove-Item Project-Template -Recurse

Start-Sleep 1
Write-Output "Done!"