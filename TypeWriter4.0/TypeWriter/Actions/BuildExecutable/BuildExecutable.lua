local FS = require("fs")
local CompileHelper = require("BuildHelper")
local Bundle = require("luvi").bundle

local function ExtractFolder(From, To)
    
end

return function ()
    local JobLocation = TypeWriter.Folder .. "/Temp/" .. string.Random(10)
    FS.mkdirSync(JobLocation)

    TypeWriter.Logger.Info("Loading compiler")
    local Compiler = CompileHelper:new(TypeWriter.ArgumentParser:GetArgument("input", "i", "./src/"), TypeWriter.ArgumentParser:GetArgument("branch", "b", "Main"))
    TypeWriter.Logger.Info("Compiling")
    Compiler:Compile()

    TypeWriter.Logger.Info("Compiled!")
    TypeWriter.Logger.Info("Writing compiled package")

    FS.writeFileSync(JobLocation .. "/Pkg.twr", Compiler:ExportJson(true))
    TypeWriter.Logger.Info("Wrote compiled package")
end