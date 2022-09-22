return function (InstallCache)
    local FS = InstallCache.FS
    local InstallLocation = InstallCache.Location
    local IgnoreDelete = {
        ["ApplicationData"] = true,
        ["Config"] = true
    }
    
    local Rmrf = require("coro-fs").rmrf
    local function ClearFolder()
        local Files = FS.readdirSync(InstallLocation)
    
        for Index, FileName in pairs(Files) do
            if not IgnoreDelete[FileName] then
                Rmrf(InstallLocation .. FileName)
            end
        end
    end

    if FS.existsSync(InstallLocation) then
        TypeWriter.Logger.Info("Removing old installation...")
        TypeWriter.Logger.Info("Deleting folder " .. InstallLocation)
        ClearFolder()
    end
end