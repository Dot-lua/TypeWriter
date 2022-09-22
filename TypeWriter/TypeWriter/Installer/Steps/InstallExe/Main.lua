return function (InstallCache)
    local FileNames = {
        [true] = "TypeWriter.exe",
        [false] = "TypeWriter"
    }
    TypeWriter.Logger.Info("Installing executable")
    p(InstallCache.Location .. "/" .. FileNames[TypeWriter.OS == "win32"])
    p(InstallCache.FS.writeFileSync(InstallCache.Location .. "/" .. FileNames[TypeWriter.OS == "win32"], InstallCache.FS.readFileSync(TypeWriter.This)))
end