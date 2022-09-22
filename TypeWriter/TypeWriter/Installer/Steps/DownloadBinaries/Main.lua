return function (InstallCache)
    local FS = InstallCache.FS
    local InstallLocation = InstallCache.Location
    FS.mkdirSync(InstallLocation .. "/Binary/")
    TypeWriter.Logger.Info("Downloading luvit binaries")
    local OsNames = {
        win32 = "Windows",
        darwin = "Darwin",
        linux = "Linux"
    }
    local BinFileName = string.format(
        "luvit-bin-%s-%s.%s",
        OsNames[TypeWriter.OS],
        require("uv").os_uname().machine,
        ({[true] = "zip", [false] = "tar.gz"})[TypeWriter.Os == "win32"]
    )
    TypeWriter.Logger.Info("Downloading " .. BinFileName)

    local BaseUrl = "https://github.com/truemedian/luvit-bin/releases/latest/download/"
    local Response, Body = require("coro-http").request("GET", BaseUrl .. BinFileName)
    local BinFile = InstallLocation .. "/Binary/" .. BinFileName
    FS.writeFileSync(BinFile, Body)
    require("../../Unzip")(BinFile, InstallLocation .. "/Binary/")
end