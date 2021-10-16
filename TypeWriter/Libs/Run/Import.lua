local FS = require("fs")
local Split = require("Split")
local Logger = require("Logger")

return function(Path)

    local PathSplitted = Split(Path, ".")
    local LastExistedPath = {}
    --p(PathSplitted)

    local FoundPath

    for SessionIndex, SessionFolder in pairs(FS.readdirSync(ProcessPath .. "Running/")) do
        Logger.Debug("Working on " .. SessionIndex .. " " .. SessionFolder)

        for PathIndex, PathString in pairs(PathSplitted) do
            Logger.Debug("Working on " .. PathIndex .. " " .. PathString)

            local ConcPath = table.concat(PathSplitted, "/", 1, PathIndex)
            local RealPath = ProcessPath .. "Running/" .. SessionFolder .. "/" .. ConcPath

            local PathExists = FS.existsSync(RealPath)

            Logger.Debug("The Concenated path is " .. ConcPath)
            Logger.Debug("The real path is " .. RealPath)
            Logger.Debug("Does the path exist? " .. tostring(PathExists))

            if PathExists == false then
                local LuaFileExists = FS.existsSync(RealPath .. ".lua")

                if LuaFileExists then
                    Logger.Debug("Found the lua file: " .. RealPath .. ".lua")
                    FoundPath = RealPath .. ".lua"
                else
                    Logger.Debug("The path did not exist, Breaking loop...")
                    --p()
                    break
                end
                
            end
            --p()
        end
    end
    
    --[[
    for i, v in pairs(PathSplitted) do
        --print()
        Logger.Debug(i, v)

        local ConcPath = table.concat(PathSplitted, "/", 1, i)
        Logger.Debug(ConcPath)

        local RealPath = ProcessPath .. "Running/" .. ConcPath
        local LuaPath = RealPath .. ".lua"
        Logger.Debug("Real " .. tostring(RealPath))
        Logger.Debug("Lua " .. tostring(LuaPath))

        local PathExists = FS.existsSync(RealPath)
        local LuaExists = FS.existsSync(LuaPath)
        Logger.Debug("PathEx " .. tostring(PathExists))
        Logger.Debug("LuaEx " .. tostring(LuaExists))

        local OneExists = PathExists-- or LuaExists

        if OneExists then
            LastExistedPath.Path = RealPath
            LastExistedPath.PathExists = PathExists
            LastExistedPath.LuaExists = LuaExists
            LastExistedPath.ExitAt = i
        end

        if not OneExists then
            Logger.Debug("Found")
            break
        end

        
    end]]

    --local FoundPath = LastExistedPath.Path .. "/" .. PathSplitted[LastExistedPath.ExitAt + 1] .. ".lua"
    --Logger.Debug("Found " .. FoundPath)

    local FoundData = nil

    local Worked, WorkedError = pcall(function()
        --p(FoundPath)
        FoundData = require(FoundPath)
    end)

    if not Worked == true then
        Logger.Debug("Import failed: " .. (WorkedError or "Unknown"))
    end

    Logger.Debug(FoundData)
    return FoundData

end