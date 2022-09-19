local GetReleases = require("./GetReleases")

return function (Pre)
    if Pre == nil then
        Pre = false
    end
    local Releases = GetReleases()
    for Index, Release in pairs(Releases) do
        if Release.prerelease == Pre then
            return Release
        end
    end
end