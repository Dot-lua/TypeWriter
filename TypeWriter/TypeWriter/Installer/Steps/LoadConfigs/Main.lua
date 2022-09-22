return function (InstallCache)
    local FS = InstallCache.FS 
    local InstallLocation = InstallCache.Location
    local Bundle = require("luvi").bundle
    if not FS.existsSync(InstallLocation .. "/Config/") then
        TypeWriter.Logger.Info("Installing config files")
        FS.mkdirSync(InstallLocation .. "/Config/")
    
        FS.writeFileSync(InstallLocation .. "/Config/Compiler.json", Bundle.readfile("Installer/Config/Compiler.json"))
        FS.writeFileSync(InstallLocation .. "/Config/DeveloperMode.json", Bundle.readfile("Installer/Config/DeveloperMode.json"))
    end
end