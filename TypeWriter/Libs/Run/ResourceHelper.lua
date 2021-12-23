local ResourceHelper = {}
local Logger = require("Logger")
local Base64 = require("base64")
local Json = require("json")

function ResourceHelper.GetRaw(Id, Path, Suppress)

    local Data = LoadedPackages[Id].Resources[Path]

    if not Data then
        if not Suppress then
            Logger.Error("Tried to load a not existing resource.")
        end
        
        return nil
    end

    return require("base64").decode(Data)

end


function ResourceHelper.GetJson(Id, Path, Suppress)

    return Json.decode(ResourceHelper.GetRaw(Id, Path, Suppress))

end



return ResourceHelper