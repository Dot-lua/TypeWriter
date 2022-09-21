local Package = require("../package")
return function ()
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
    local Running = TypeWriter.ProcessMonitor:GetInstancesOf("TypeWriter.exe")
    if Running ~= 1 then
        TypeWriter.Logger.Error("Update available but there are instances running, Stop running instances to update! (%s running)", Running - 1)
        return
    end
    require("./Update")(Latest)
end