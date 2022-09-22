return function (InstallCache)
    local FS = InstallCache.FS
    local InstallLocation = InstallCache.Location
    local RequestLib = require("../../Request.lua")
    local Request = RequestLib.Request
    local JsonRequest = RequestLib.JsonRequest
    TypeWriter.Logger.Info("Downloading internal libraries")
    
    FS.mkdirSync(InstallLocation .. "/Internal/")

    local _, PackageMeta = JsonRequest(
        "GET",
        "https://raw.githubusercontent.com/Dot-lua/Internal-packages/main/Releases/Meta.json",
        {
            {"User-Agent", "TypeWriter"}
        }
    )

    for Index, Package in pairs(PackageMeta) do
        TypeWriter.Logger.Info("Downloading " .. Package.Name .. " from \"" .. Package.Url .. "\"")
        local Response, Body = Request(
            "GET",
            Package.Url,
            {
                {"User-Agent", "TypeWriter"}
            }
        )
        FS.writeFileSync(InstallLocation .. "/Internal/" .. Package.Name, Body)
    end
end