local FS = require("fs")
local CompileHelper = require("BuildHelper")
local RuntimeFunctions = require("RuntimeFunctions")

return function ()

    local Compiler = CompileHelper:new(TypeWriter.ArgumentParser:GetArgument("input", "i", "./src/"), "Main")
    Compiler:Compile()

    TypeWriter.Runtime = RuntimeFunctions
    _G.Import = RuntimeFunctions.Import

    _G.require = RuntimeFunctions.Require

    RuntimeFunctions.LoadRaw(Compiler:ExportRaw())
    Import(Compiler:ExportRaw().Package.Entrypoints.Main)
end