local Logger = require("Logger")
local PathLibrary = require("Path")
local Split = require("Split")
local FS = require("fs")

return function(Args)
    local Path = PathLibrary.resolve(Args[2])

    if not Args[1] or not Path then
        ProcessHelper.Fail("File not found!")
        return
    end

    Logger.Info("Starting process with id: " .. RuntimeSession)
    _G.ProcessPath = RuntimePath .. "Cache/Run/" .. RuntimeSession .. "/"

    FS.mkdirSync(RuntimePath .. "/Cache/Run/")
    FS.mkdirSync(RuntimePath .. "/Cache/Run/" .. RuntimeSession .. "/")
    FS.mkdirSync(RuntimePath .. "/Cache/Run/" .. RuntimeSession .. "/Archives/")
    FS.mkdirSync(RuntimePath .. "/Cache/Run/" .. RuntimeSession .. "/Running/")
    FS.mkdirSync(RuntimePath .. "/Cache/Run/" .. RuntimeSession .. "/Resources/")
    FS.mkdirSync(RuntimePath .. "/Cache/Run/" .. RuntimeSession .. "/UnpackCache/")

    _G.LoadedPackages = {}
        
    _G.Import = require("Run/Import")
    _G.LoadPackage = require("Run/LoadPackage")
    _G.LoadInternal = require("Run/LoadInternal")
    _G.CallEntrypoint = require("Run/CallEntrypoint")
    _G.Class = require("core").Object

    LoadPackage(Path, false, true)

    local MainEntry = Import(ProcessInfo.Entrypoints.Main)

    if not MainEntry then
        Logger.Error("The main entry of " .. ProcessInfo.ID .. " '" .. ProcessInfo.Entrypoints.Main .. "' was not found!")
        process:exit(1)
    end

    local EntryWorked, EntryError = pcall(function()
        MainEntry.OnInitialize()
    end)

    if not EntryWorked then

        local ParseStepOne = Split(EntryError, "\\")

        table.remove(ParseStepOne, 1)
        table.remove(ParseStepOne, 1)
        table.remove(ParseStepOne, 1)

        local ParseStepTwo = ParseStepOne[#ParseStepOne]    
        table.remove(ParseStepOne, #ParseStepOne)
        local TwoParsed = Split(ParseStepTwo, ":")

        print()
        Logger.Error("Error at: '" .. table.concat(ParseStepOne, ".") .. "." .. TwoParsed[1] .. "' line: " .. TwoParsed[2])
        Logger.Error(string.sub(TwoParsed[3], 2))

        process:exit(1)
    else
        Logger.Info("Process complete")
        Logger.Info("Exiting...")
    end
        



end