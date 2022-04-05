local FS = require("fs")
local RuntimeFunctions = require("RuntimeFunctions")

return function ()
    
    TypeWriter.Runtime = RuntimeFunctions
    _G.Import = RuntimeFunctions.Import

    local InputPath = TypeWriter.ArgumentParser:GetArgument("input", "i", "")
    if InputPath == "" then
        TypeWriter.Logger.Error("No input path specified")
        return
    end
    
    Import(RuntimeFunctions.LoadFile(InputPath).Entrypoints.Main)
    
end