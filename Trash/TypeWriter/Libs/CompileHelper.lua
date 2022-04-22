local FS = require("fs")
local Logger = require("Logger")
local Split = require("Split")
local Path = require("path")

return function(Path)
    local Compiled = {}

    local PackageData = FS.readFileSync(Path .. "resources/package.info.lua")
    
    Compiled.PackageInfo = loadstring(PackageData)()
    Compiled.Code = {}
    Compiled.Resources = {} 

    Logger.Debug(Path)

    function ScanDir(Dir, SubDir)
        Logger.Debug("Scanning " .. Dir)
        Logger.Debug(SubDir)

        for i, v in FS.scandirSync(Dir) do
            Logger.Debug(i .. " " .. v)

            if v == "directory" then
                ScanDir(Dir .. "/" .. i, SubDir .. "/" .. i)
            elseif v == "file" then
                local SplitFile = Split(i, ".")
                local CurrentPath = table.concat(Split(SubDir, "/"), ".") .. "." .. table.concat(SplitFile, ".", 1, #SplitFile - 1)

                Logger.Debug(CurrentPath)
                Logger.Debug(Dir .. "/" .. i)
                Compiled.Code[CurrentPath] = FS.readFileSync(Dir .. "/" .. i)
            end
        end
    end

    function ReadResources(Dir, SubDir)
        Logger.Debug("Reading " .. Dir)
        Logger.Debug(SubDir)

        for i, v in FS.scandirSync(Dir) do
            Logger.Debug(i .. " " .. v)

            if v == "directory" then
                ReadResources(Dir .. "/" .. i, SubDir .. "/" .. i)
            elseif v == "file" then
                local SplitFile = Split(i, ".")
                local CurrentPath = table.concat(Split(SubDir, "/"), "/") .. "/" .. table.concat(SplitFile, ".", 1, #SplitFile - 0)

                Logger.Debug(CurrentPath)
                Logger.Debug(Dir .. "/" .. i)
                Compiled.Resources[CurrentPath] = require("base64").encode(FS.readFileSync(Dir .. "/" .. i))
            end
        end
    end


    ScanDir(Path .. "lua", "")
    ReadResources(Path .. "resources", "")


    return Compiled

end