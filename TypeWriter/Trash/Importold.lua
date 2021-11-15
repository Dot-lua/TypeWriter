local FS = require("fs")
local Split = require("Split")
local Logger = require("Logger")

return function(Path)

    local PathSplitted = Split(Path, ".")
    --Logger.Info("Finding " .. Path)

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
                    break
                else
                    Logger.Debug("The path did not exist, Breaking loop...")
                    break
                end
                
            end
        end

        if FoundPath then break end
    end

    local FoundData = nil

    local Worked, WorkedError = pcall(function()
        Logger.Debug(FoundPath)
        FoundData = require(FoundPath)
    end)

    if not Worked == true then
        Logger.Warn("Import failed for '" .. Path .. "': " .. (WorkedError or "Unknown"))
    end

    Logger.Debug(FoundData)
    return FoundData

end