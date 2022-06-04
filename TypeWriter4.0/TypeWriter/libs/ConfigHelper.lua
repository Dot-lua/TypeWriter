local ConfigHelper = Class:extend()

local Json = require("json")
local FS = require("fs")

local function ReadConfig(Name)
    return Json.decode(
        FS.readFileSync(TypeWriter.Folder .. "/Config/" .. Name)
    )
end

local function BoolTable(Tbl)
    local Out = {}
    for Index, Value in pairs(Tbl) do
        Out[Value] = true
    end
    return Out
end

function ConfigHelper:initialize()
    self.Config = {
        DevMode = ReadConfig("DeveloperMode.json"),
        Compiler = ReadConfig("Compiler.json"),
    }
    self.Config.Compiler.Ignore.Code = BoolTable(self.Config.Compiler.Ignore.Code)
    self.Config.Compiler.Ignore.Resources = BoolTable(self.Config.Compiler.Ignore.Resources)
end

function ConfigHelper:ExportConfig()
    return self.Config
end

return ConfigHelper