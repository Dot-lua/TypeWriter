local Spawn = require("coro-spawn")
local FS = require("fs")

return function (Name)
    if FS.existsSync(TypeWriter.Folder .. "/PackageCache/" .. string.split(Name, "/")[2]) then
        return
    end

    TypeWriter.Logger.Info("Downloading " .. Name)
    local Result, Error = Spawn(
        "git",
        {
            cwd = TypeWriter.Folder .. "/PackageCache/",
            args = {
                "clone",
                "https://github.com/" .. Name
            }
        }
    )
    Result.waitExit()
end