local GetReleases = require("./GetReleases")

return function (Pre)
    if Pre == nil then
        Pre = false
    end
    local Releases = GetReleases()
    for Index, Release in pairs(Releases) do
        --print(require("json").encode(Release, {indent = true}))
        if Release.prerelease == Pre then
            return Release.tag_name
        end
    end
end