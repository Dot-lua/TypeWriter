return function()
    _G.FS = require("fs")
    _G.Json = require("json")
    _G.Timer = require("timer")
    _G.Sleep = Timer.sleep
    _G.Wait = function(Sec) return Sleep(Sec * 1000) end
    _G.LOS = require("los")
    _G.Split = require("Split")

    _G.Import = require("Run/Import")
    _G.LoadPackage = require("Run/LoadPackage")
    _G.LoadInternal = require("Run/LoadInternal")
    _G.CallEntrypoint = require("Run/CallEntrypoint")
    _G.ResourceHelper = require("Run/ResourceHelper")

    _G.Class = require("core").Object
    _G.Emitter = require("core").Emitter


    table.ToString = require("Run/TableToString")
    string.Random = require("RandomString")

    local RequireLoader = function (ModuleName)
        for Index, Folder in pairs(FS.readdirSync(RuntimePath .. "/Cache/Dependencies/")) do
            if string.match(Folder, "%-" .. ModuleName .. "@*") then
                local Data = FS.readFileSync(RuntimePath .. "/Cache/Dependencies/" .. Folder .. "/init.lua")
                return loadstring(Data)()
            end
        end

        print(debug.traceback())
        return "\n\tno module '" .. ModuleName .. "' in typewriter cache (did you forget it in your dependencies)"
    end

    table.insert(package.loaders, 2, RequireLoader)
end