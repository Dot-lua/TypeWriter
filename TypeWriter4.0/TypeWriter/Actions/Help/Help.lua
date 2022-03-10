local Logger = require("Logger")
local FS = require("fs")

return function ()
    Logger:Info(FS.readFileSync("./Usage.txt"))
end