local OS = require("los").type()
local Spawn = require("coro-spawn")
local Path = require("path")
local FS = require("fs")
local Split = string.split

local Functions = {
    ["win32"] = function (From, To)
        FS.mkdirSync(To)
        local Result, Error = Spawn(
            "tar",
            {
                args = {
                    "-xf", Path.resolve(From),
                    "-C", Path.resolve(To)
                }
            }
        )
        Result.waitExit()

    end,
    ["darwin"] = function (From, To)
        FS.mkdirSync(To)
        local Result, Error = Spawn(
            "unzip",
            {
                args = {
                    Path.resolve(From)
                },
                cwd = To
            }
        )

        for Line in Result.stdout.read do
            Process.stdout:write(Line)
        end
        Result.waitExit()
    end
}

return function (From, To)
    return Functions[OS](From, To)
end