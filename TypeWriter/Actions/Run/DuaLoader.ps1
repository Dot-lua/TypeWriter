$RuntimePath = $args[0]
$ProcessId = $args[1]
$Location = $args[2]
$FileName = $args[3]

#$global:ProgressPreference = 'SilentlyContinue'

Copy-Item -Path "$Location" -Destination "$RuntimePath/Cache/Run/$ProcessId/Archives/"

Move-Item -Path "$RuntimePath/Cache/Run/$ProcessId/Archives/$FileName" -Destination "$RuntimePath/Cache/Run/$ProcessId/Archives/$FileName.zip"

$ProgressPreference = 'SilentlyContinue'
Expand-Archive -Path "$RuntimePath/Cache/Run/$ProcessId/Archives/$FileName.zip" -DestinationPath "$RuntimePath/Cache/Run/$ProcessId/UnpackCache/"
$ProgressPreference = 'Continue'

Move-Item -Path "$RuntimePath/Cache/Run/$ProcessId/Archives/$FileName.zip" -Destination "$RuntimePath/Cache/Run/$ProcessId/Archives/$FileName"