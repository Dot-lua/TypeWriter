local FS = require("fs")
local Logger = require("Logger")

local PathLibrary = require("Path")
local Split = require("Split")

return function()
    if not FS.existsSync(RuntimeLocation .. "/src") then
        Logger.Error("The folder 'src' does not exist")
        Logger.Error("Create one using --setup")
        
        return false
    end

    FS.mkdirSync(RuntimeLocation .. "TypeWriter")
    FS.mkdirSync(RuntimeLocation .. "TypeWriter/Out")

    Logger.Info("Building into Project.dua with CacheHolder " .. RuntimeSession)

    FS.mkdirSync(RuntimePath .. "Cache/Compile/" .. RuntimeSession)
    FS.mkdirSync(RuntimePath .. "Cache/Compile/" .. RuntimeSession .. "/Data")
    FS.mkdirSync(RuntimePath .. "Cache/Compile/" .. RuntimeSession .. "/Out")

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

    --run

    local Path = PathLibrary.resolve(RuntimeLocation .. "/TypeWriter/Out/Project.dua")

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
        Logger.Info("Package log:")
        p()
        MainEntry.OnInitialize()
    end)

    if not EntryWorked then
        Logger.Error("Error in runtime, " .. EntryError)
    end

    --[[
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
    end]]
end