return function (InstallCache)
    local FileNames = {
        [true] = "TypeWriter.exe",
        [false] = "TypeWriter"
    }
    TypeWriter.Logger.Info("Installing executable")
    InstallCache.FS.writeFileSync(InstallCache.Location .. "/" .. FileNames[TypeWriter.OS == "win32"], InstallCache.FS.readFileSync(TypeWriter.This))
end