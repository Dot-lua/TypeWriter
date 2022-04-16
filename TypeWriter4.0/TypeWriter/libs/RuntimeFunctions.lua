local RuntimeFunctions = {}

local Json = require("json")
local FS = require("fs")
local PathLibrary = require("path")
local FetchPackage = require("LIT/FetchPackage")
local FetchRepository = require("GIT/FetchRepository")

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

    if Data.Package.Dependencies == nil then Data.Package.Dependencies = {} end

    if Data.Package.Dependencies.Luvit == nil then Data.Package.Dependencies.Luvit = {} end
    for Index, Dependency in pairs(Data.Package.Dependencies.Luvit) do
        FetchPackage(Dependency)
    end

    if Data.Package.Dependencies.Git == nil then Data.Package.Dependencies.Git = {} end
    for Index, Dependency in pairs(Data.Package.Dependencies.Git) do
        FetchRepository(Dependency)
    end

    TypeWriter.LoadedPackages[Data.Package.ID] = Data
    return Data.Package
end

function RuntimeFunctions.Import(Path)
    for _, Package in pairs(TypeWriter.LoadedPackages) do
        for CodePath, CodeData in pairs(Package.Code) do
            if CodePath == Path then
                if CodeData.Type == "Code" then
                    return load(CodeData.Code)(Path)
                elseif CodeData.Type == "Redirect" then
                    return RuntimeFunctions.Import(CodeData.RedirectTo)
                end
            end
        end
    end
    return nil
end

function RuntimeFunctions.Require(Path)
    if FS.existsSync(TypeWriter.Folder .. "/PackageCache/" .. Path) then
        return require(TypeWriter.Folder .. "/PackageCache/" .. Path .. "/init.lua")
    else
        return require(Path)
    end
end

return RuntimeFunctions