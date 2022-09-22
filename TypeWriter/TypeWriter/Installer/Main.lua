local FS = require("fs")

local function InstallLocation()
    local Locations = {
        [true] = (process.env.APPDATA or "") .. "\\.TypeWriter\\",
        [false] = (process.env.HOME or "") .. "/.TypeWriter/"
    }

    local OverWriteArg = TypeWriter.ArgumentParser:GetArgument("install-overwrite", "install-overwrite", "false")
    local OverWritePath = require("path").resolve(OverWriteArg)
    if OverWriteArg ~= "false" then
        return OverWritePath
    end
    return Locations[TypeWriter.OS == "win32"]
end

local InstallCache = {
    Location = InstallLocation(),
    FS = FS
}
FS.mkdirSync(InstallCache.Location)
p(FS.writeFileSync(InstallCache.Location .. "/SessionStorage", "0"))

require("./Steps/ClearFolder/Main.lua")(InstallCache)
require("./Steps/InstallExe/Main.lua")(InstallCache)
require("./Steps/LoadConfigs/Main.lua")(InstallCache)
require("./Steps/DownloadBinaries/Main.lua")(InstallCache)
require("./Steps/DownloadInternal/Main.lua")(InstallCache)
require("./Steps/Finish/Main.lua")(InstallCache)
