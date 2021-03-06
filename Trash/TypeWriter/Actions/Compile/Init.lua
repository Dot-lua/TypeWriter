local CompileHelper = require("CompileHelper")
local Logger = require("Logger")
local FS = require("fs")
local Json = require("json")

return function(Args)
    Logger.Info("Compiling...")
    local CompiledData = CompileHelper(RuntimeLocation .. "src/main/")
    Logger.Info("Compiled!")

    FS.mkdirSync(RuntimeLocation .. "TypeWriter")
    FS.mkdirSync(RuntimeLocation .. "TypeWriter/Out")

    Logger.Info("Writing to '" .. CompiledData.PackageInfo.Name .. ".dua'!")
    FS.writeFileSync(RuntimeLocation .. "TypeWriter/Out/" .. CompiledData.PackageInfo.Name .. ".dua", Json.stringify(CompiledData, {indent = true}))
    Logger.Info("Done writing")
end