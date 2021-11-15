local FS = require("fs")
local Path = require("path")
local Logger = require("Logger")

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

    local MalformedRuntimePath = string.sub(RuntimePath, 1, #RuntimePath - 1)

    local UnpackSession = require("RandomString")(5)
    Logger.Debug("Creating Unpack Session " .. UnpackSession)

    FS.mkdirSync(RuntimePath .. "Cache/Run/" .. RuntimeSession .. "/UnpackCache/" .. UnpackSession .. "/")
    
    local CommandWindows = "PowerShell -NoProfile -ExecutionPolicy unrestricted -File " .. RuntimePath .. "Actions/Run/DuaLoader.ps1 " .. RuntimePath .. " " .. RuntimeSession .. " " .. FilePos .. " " .. FileBase .. " " .. UnpackSession
    local CommandMac = "sh " .. RuntimePath .. "Scripts/Loaders/DuaLoader.sh " .. RuntimeSession .. " " .. FilePos .. " " .. FileBase

    local Handle

    if RuntimeOS == "Windows" then
        Handle = io.popen(CommandWindows)
    elseif RuntimeOS == "Mac" then
        Handle = io.popen(CommandMac)
    end

    for Line in Handle:lines() do
        Logger.Info(Line)
    end

    Handle:close()

    local PackageInfo = require(ProcessPath .. "UnpackCache/" .. UnpackSession .. "/package.info.lua")

    if LoadedPackages[PackageInfo.ID] then
        Logger.Warn("Package " .. PackageInfo.ID .. " was already loaded")
        return nil, "Already Loaded"
    end

    LoadedPackages[PackageInfo.ID] = PackageInfo

    FS.unlinkSync(ProcessPath .. "UnpackCache/" .. UnpackSession .. "/package.info.lua")


    local ResDirExists = FS.existsSync(ProcessPath .. "UnpackCache/" .. UnpackSession .. "/resources/")

    if ResDirExists then
        local ResDir = FS.readdirSync(ProcessPath .. "UnpackCache/" .. UnpackSession .. "/resources/")

        for i, v in pairs(ResDir) do
            FS.renameSync(
                ProcessPath .. "UnpackCache/" .. UnpackSession .. "/resources/" .. v,
                ProcessPath .. "/Resources/" .. v
            )
        end

        FS.rmdirSync(ProcessPath .. "UnpackCache/" .. UnpackSession .. "/resources/" )
    end

    if IsMain then
        _G.ProcessInfo = PackageInfo
    end

    FS.mkdirSync(ProcessPath .. "Running/" .. FileBase .. "-" .. UnpackSession ..  "/")

    local DirFiles = FS.readdirSync(ProcessPath .. "UnpackCache/" .. UnpackSession .. "/")

    for i, v in pairs(DirFiles) do
        --print(i, v)

        FS.renameSync(
            ProcessPath .. "UnpackCache/" .. UnpackSession .. "/" .. v,
            ProcessPath .. "Running/" .. FileBase .. "-" .. UnpackSession .. "/" .. v
        )
    end

    if PackageInfo.Entrypoints.OnLoad then
        Logger.Error("Loading entrypoint Onload from " .. PackageInfo.Name)
        Import(PackageInfo.Entrypoints.OnLoad)
    end
    
    return PackageInfo
end