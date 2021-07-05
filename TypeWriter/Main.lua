return function()
    _G.RuntimeArgs = args
    _G.RuntimePath = require("path").resolve(RuntimeArgs[0], "../../")
    _G.RuntimeLocation = require("path").resolve("./") .. "\\"
    _G.RuntimeOS = require("GetOS")()
    RuntimeArgs[0] = nil
    table.remove(RuntimeArgs, 1)

    local FS = require("fs")

    FS.mkdirSync(RuntimePath .. "/Cache")

    FS.mkdirSync(RuntimePath .. "/Cache/Run")
    FS.mkdirSync(RuntimePath .. "/Cache/Setup")
    FS.mkdirSync(RuntimePath .. "/Cache/Compile")

    local Options = require("./Options")
end