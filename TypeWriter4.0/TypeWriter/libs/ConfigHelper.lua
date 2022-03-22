local ConfigHelper = Class:extend()

local Json = require("json")
local FS = require("fs")

local function ReadConfig(Name)
    return Json.decode(
        FS.readFileSync(TypeWriter.Folder .. "/Config/" .. Name)
    )
end

function ConfigHelper:initialize()
    self.Config = {
        DevMode = ReadConfig("DeveloperMode.json")
    }
end

function ConfigHelper:ExportConfig()
    return self.Config
end

return ConfigHelper