local FS = require("fs")
local Logger = require("Logger")

return function(Args)
    if not FS.existsSync(RuntimeLocation .. "/src") then
        Logger.Error("The folder 'src' does not exist")
        Logger.Error("Create one using --setup")
        
        return false
    end

    FS.mkdirSync(RuntimeLocation .. "TypeWriter")
    FS.mkdirSync(RuntimeLocation .. "TypeWriter/Out")

    Logger.Info("Building into Project.dua with CacheHolder " .. CacheHolder)

    FS.mkdirSync(RuntimePath .. "Cache/Compile/" .. CacheHolder)
    FS.mkdirSync(RuntimePath .. "Cache/Compile/" .. CacheHolder .. "/Data")
    FS.mkdirSync(RuntimePath .. "Cache/Compile/" .. CacheHolder .. "/Out")

    local CommandWindows = "PowerShell -NoProfile -ExecutionPolicy unrestricted -File " ..RuntimePath .. "Actions/Compile/Compile.ps1 " .. "Project" .. " " .. RuntimeSession .. " " .. RuntimePath .. " " .. RuntimeLocation
    local CommandMac = "sh ./Dotter/Scripts/Init/DownloadTemplate.sh"

    local Handle

    if RuntimeOS == "Windows" then
        Handle = io.popen(CommandWindows)
    elseif WorkingOS == "Mac" then
        Handle = io.popen(CommandMac, "r")
    end

    for Line in Handle:lines() do
        Logger.Info(Line)
    end

    Handle:close()


end