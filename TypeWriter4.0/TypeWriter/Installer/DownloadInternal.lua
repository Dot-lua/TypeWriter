local FS = require("fs")
local Request = require("./Request").Request
local JsonRequest = require("./Request").JsonRequest

return function (Folder)
    FS.mkdirSync(Folder .. "/Internal/")

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
        FS.writeFileSync(Folder .. "/Internal/" .. Package.Name, Body)
    end
end