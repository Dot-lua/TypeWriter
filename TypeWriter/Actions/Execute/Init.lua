local FS = require("fs")
local Logger = require("Logger")

local PathLibrary = require("Path")
local Split = require("Split")
local CompileHelper = require("CompileHelper")

return function()
    local CompiledData = CompileHelper(RuntimeLocation .. "src/main/")
    Logger.Info("Compiled!")

    FS.mkdirSync(RuntimeLocation .. "TypeWriter")
    FS.mkdirSync(RuntimeLocation .. "TypeWriter/Out")

    Logger.Info("Writing to '" .. CompiledData.PackageInfo.Name .. ".dua'!")
    FS.writeFileSync(RuntimeLocation .. "TypeWriter/Out/" .. CompiledData.PackageInfo.Name .. ".dua", require("PrettyJson/lib/pretty/json.lua").stringify(CompiledData, nil, 4))

    Logger.Info("Starting process with id: " .. RuntimeSession)

    _G.LoadedPackages = {}
        
    require("LoadExecutionValues.lua")()

    LoadPackage(RuntimeLocation .. "TypeWriter/Out/" .. CompiledData.PackageInfo.Name .. ".dua", false, true)

    local MainEntry = Import(ProcessInfo.Entrypoints.Main)

    if not MainEntry then
        Logger.Error("The main entry of " .. ProcessInfo.ID .. " '" .. ProcessInfo.Entrypoints.Main .. "' was not found!")
        process:exit(1)
    end

    local EntryWorked, EntryError = pcall(function()
        MainEntry.OnInitialize()
    end)

    if not EntryWorked then
        Logger.Error("Error in runtime, " .. EntryError)
    end
end