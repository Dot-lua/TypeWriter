local RuntimeFunctions = {}

local Json = require("json")
local FS = require("fs")
local PathLibrary = require("path")

function RuntimeFunctions.LoadFile(Path, Check)
    if Check == nil then
        Check = true
    end

    if Check then
        if not FS.existsSync(Path) then
            TypeWriter.Logger.Error("Trying to load a non existing file: " .. Path)
            process:exit(1)
        end
        if PathLibrary.extname(Path) ~= ".twr" then
            TypeWriter.Logger.Error("Trying to load a non twr file: " .. Path)
            process:exit(1)
        end
    end

    return RuntimeFunctions.LoadJson(FS.readFileSync(Path))
end

function RuntimeFunctions.LoadJson(JsonData)
    return RuntimeFunctions.LoadRaw(Json.decode(JsonData))
end

function RuntimeFunctions.LoadRaw(Data)
    if not TypeWriter.LoadedPackages then
        TypeWriter.LoadedPackages = {}
    end
    TypeWriter.LoadedPackages[Data.Package.ID] = Data
    return Data.Package
end

function RuntimeFunctions.Import(Path)
    for _, Package in pairs(TypeWriter.LoadedPackages) do
        for CodePath, CodeData in pairs(Package.Code) do
            if CodePath == Path then
                if CodeData.Type == "Code" then
                    return load(CodeData.Code)()
                elseif CodeData.Type == "Redirect" then
                    return RuntimeFunctions.Import(CodeData.RedirectTo)
                end
            end
        end
    end
end

return RuntimeFunctions