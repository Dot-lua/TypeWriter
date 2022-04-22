local FS = require("fs")
local Split = require("Split")
local Logger = require("Logger")

return function(Path)

    for i, v in pairs(LoadedPackages) do
        if v.Code[Path] then
            local Returned, Error = loadstring(v.Code[Path])
            if Error then
                Logger.Error("Error loading '" .. Path .. "': " .. Error)
            else
                return Returned()
            end
        end
    end

end