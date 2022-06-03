local Package = require("../package")
return function ()
    if TypeWriter.SessionManager:GetRunningCount() ~= 0 then
        return
    end
    if not require("./HasInternet")() then
        return
    end
    local Latest = require("./GetLatestRelease")()
    if Latest == nil then
        -- Might be rate limited?
        return
    end
    if Latest.tag_name == Package.version then
        return
    end
    require("./Update")(Latest)
end