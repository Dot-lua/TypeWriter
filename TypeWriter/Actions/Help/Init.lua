local Logger = require("Logger")

return function(Args)

    local Lines = require(RuntimePath .. "/Libs/Split.lua")(require("FS").readFileSync(RuntimePath .. "/Actions/Help/Usage.txt"), "\r\n")

    for Index, Line in pairs(Lines) do
        Logger.Info(Line)
    end

end