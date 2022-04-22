local FS = require("fs")
local Json = require("json")
local Path = require("path")
local Logger = require("Logger")
local FetchPackage = require("LIT/FetchPackage")

return function(PackagePath, Log, IsMain)

    local FilePos = PackagePath -- Path.normalize(PackagePath)
    local FileBase = Path.basename(FilePos)
    local Extension = Path.extname(FileBase)
    local Exists = FS.existsSync(FilePos)

    
    local CorrectExtension = Extension == ".dua"

    Logger.Debug("Trying to load file " .. FilePos)
    Logger.Debug("File name is: " .. FileBase)
    Logger.Debug("Is Correct Extension: " .. tostring(CorrectExtension))
    Logger.Debug("Extension: '" .. (Extension or "") .. "'")
    Logger.Debug("Exists: " .. tostring(Exists))

    if not Exists or not Extension then
        Logger.Error("'" .. FileBase .. "' is not a valid DUA archive!")
        process:exit(1)
    end

    local DuaData = FS.readFileSync(FilePos)
    local UnpackedData = Json.decode(DuaData)

    local PackageInfo = UnpackedData.PackageInfo

    for Index, Dep in pairs(PackageInfo.Dependencies.Luvit) do
        FetchPackage(Dep)
    end

    LoadedPackages[PackageInfo.ID] = UnpackedData


    if IsMain then
        _G.ProcessInfo = PackageInfo
    end

    if PackageInfo.Entrypoints.OnLoad then
        Logger.Debug("Loading entrypoint Onload from " .. PackageInfo.Name)
        Import(PackageInfo.Entrypoints.OnLoad)
    end

    return PackageInfo
end