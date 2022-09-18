local FS = require("fs")
local CompileHelper = require("BuildHelper")

return function ()
    TypeWriter.Logger.Info("Removing cache")
    require("coro-fs").rmrf(TypeWriter.Folder .. "/PackageCache/")
    TypeWriter.Logger.Info("Cache removed")
end