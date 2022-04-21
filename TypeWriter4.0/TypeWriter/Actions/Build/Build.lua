local FS = require("fs")
local CompileHelper = require("BuildHelper")

return function ()

    TypeWriter.Logger.Info("Loading compiler")
    local Compiler = CompileHelper:new(TypeWriter.ArgumentParser:GetArgument("input", "i", "./src/"), TypeWriter.ArgumentParser:GetArgument("branch", "b", "Main"))
    TypeWriter.Logger.Info("Compiling")
    Compiler:Compile()

    TypeWriter.Logger.Info("Compiled!")
    TypeWriter.Logger.Info("Writing compiled package")
    local OutputLocation = TypeWriter.ArgumentParser:GetArgument("output", "o", "./")
    FS.mkdirSync(OutputLocation .. "/TypeWriter/")
    FS.mkdirSync(OutputLocation .. "/TypeWriter/Build/")

    FS.writeFileSync(OutputLocation .. "/TypeWriter/Build/" .. Compiler.Compiled.Package.ID .. ".twr", Compiler:ExportJson(true))
    TypeWriter.Logger.Info("Wrote compiled package")
    TypeWriter.Logger.Info("Task complete")
end