local FS = require("fs")
local CompileHelper = require("BuildHelper")
local RuntimeFunctions = require("RuntimeFunctions")

return function ()

    TypeWriter.Logger.Info("Loading compiler")
    local Compiler = CompileHelper:new(TypeWriter.ArgumentParser:GetArgument("input", "i", "./src/"), "Main")
    TypeWriter.Logger.Info("Compiling")
    Compiler:Compile()

    TypeWriter.Logger.Info("Compiled!")
    TypeWriter.Logger.Info("Writing compiled package")

    TypeWriter.Runtime = RuntimeFunctions
    _G.Import = RuntimeFunctions.Import

    _G.require = RuntimeFunctions.Require

    RuntimeFunctions.LoadRaw(Compiler:ExportRaw())
    Import(Compiler:ExportRaw().Package.Entrypoints.Main)
end