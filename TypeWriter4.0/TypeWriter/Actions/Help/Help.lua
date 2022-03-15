local FS = require("fs")
local Bundle = require("luvi").bundle

return function ()
    TypeWriter.Logger.Info(Bundle.readfile("/Actions/Help/Usage.txt"))
end