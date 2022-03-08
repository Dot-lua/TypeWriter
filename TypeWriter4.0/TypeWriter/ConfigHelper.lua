local ConfigHelper = Class:extend()

function ConfigHelper:initialize()
    self.Config = {
        DevMode = require("../Config/DevMode.lua")
    }
end

function ConfigHelper:ExportConfig()
    return self.Config
end

return ConfigHelper