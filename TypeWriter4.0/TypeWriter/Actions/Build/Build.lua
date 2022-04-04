local FS = require("fs")
local CompileHelper = require("BuildHelper")

return function ()

    local Compiler = CompileHelper:new(TypeWriter.ArgumentParser:GetArgument("input", "i", "./src/"), "Main")
    Compiler:Compile()

    local OutputLocation = TypeWriter.ArgumentParser:GetArgument("output", "o", "./")
    FS.mkdirSync(OutputLocation .. "/TypeWriter/")
    FS.mkdirSync(OutputLocation .. "/TypeWriter/Build/")

    FS.writeFileSync(OutputLocation .. "/TypeWriter/Build/" .. Compiler.Compiled.Package.ID .. ".twr", Compiler:ExportJson(true))
    return p()

end