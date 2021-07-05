$Output = $args[0]
$CacheHolder = $args[1]
$RuntimePath = $args[2]
$RuntimeLocation = $args[3]

$CachePath = "$RuntimePath/Cache/Compile/$CacheHolder"

Write-Output "Generating output to $output.dua"
Start-Sleep 1


Write-Output "Cloning src folder..."
Copy-Item "$RuntimeLocation/src" -Recurse -Destination "$CachePath/Data"

Write-Output "Unpacking main folder to src..."
Move-Item "$CachePath/Data/src/main/*" "$CachePath/Data/src/"

Write-Output "Unpacking lua folder"
Move-Item "$CachePath/Data/src/lua/*" "$CachePath/Data/src/"

Write-Output "Removing lua and main folder"
Remove-Item "$CachePath/Data/src/lua/" -Recurse
Remove-Item "$CachePath/Data/src/main/" -Recurse

Move-Item "$CachePath/Data/src/resources/package.info.lua" "$CachePath/Data/src/"

Write-Output "Compressing dua"

$ProgressPreference = 'SilentlyContinue'
Compress-Archive -path "$CachePath/Data/src/*" -DestinationPath "$CachePath/Out/Out.zip"
$ProgressPreference = 'Continue'

Start-Sleep 1

Write-Output "Cleaning archive"
Copy-Item "$CachePath/Out/Out.zip" "$CachePath/Out/$Output.dua"

Write-Output "Moving archive"
Copy-Item "$CachePath/Out/$Output.dua" -Destination "$RuntimeLocation/TypeWriter/Out/$output.dua"

Write-Output "Done!"
Start-Sleep 1