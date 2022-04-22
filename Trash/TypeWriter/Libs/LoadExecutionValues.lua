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

    _G.require = ({require(RuntimePath .. "/Libs/require.lua")(RuntimePath)})[1]


    table.ToString = require("Run/TableToString")
    string.Random = require("RandomString")
end