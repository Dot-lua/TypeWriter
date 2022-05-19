local FS = require("fs")
local RuntimeFunctions = require("RuntimeFunctions")

return function ()
    
    TypeWriter.Runtime = RuntimeFunctions
    _G.Import = RuntimeFunctions.Import

    _G.require = RuntimeFunctions.Require

    local InputPath = TypeWriter.Input
    
    Import(RuntimeFunctions.LoadFile(InputPath).Entrypoints.Main)
    
end