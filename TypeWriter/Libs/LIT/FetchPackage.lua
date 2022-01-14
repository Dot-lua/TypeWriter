local FS = require("FS")
local Logger = require("Logger.lua")
local Split = require("Split")
local Request = require("LIT/Request")
local Sleep = require("timer").sleep

local BASEURL = "https://lit.luvit.io"

local function DownloadTree(Folder, Url)
    local _, Data = Request.Json("GET", Url)

    local Complete = 0
    for Index, File in pairs(Data) do
        coroutine.wrap(function ()
            if File.mode == 33188 then
                Logger.Info("Fetching file " .. File.name)
                local _, FileData = Request.Raw("GET", File.url)
                FS.writeFileSync(Folder .. File.name, FileData)
            elseif File.mode == 16384 then
                Logger.Info("Fetching folder " .. File.name)
                FS.mkdirSync(Folder .. File.name .. "/")
                DownloadTree(Folder .. File.name .. "/", File.url)
            end
            Complete = Complete + 1
        end)()
    end

    repeat
        Sleep(50)
    until Complete == #Data
end

local function FetchPackage(Name)

    local Author = Split(Name, "/")[1]
    local PackageName = Split(Split(Name, "/")[2], "@")[1]
    local Version = Split(Name, "@")[2] or ""

    local Found = false
    for Index, Folder in pairs(FS.readdirSync(RuntimePath .. "/Cache/Dependencies/")) do
        Found = (string.match(Folder, PackageName) ~= nil) or Found
    end

    if Found then return end
    Logger.Info("Downloading " .. Name)


    local Link
    if Version == "" then
        Version, Link = require("LIT/GetLatest")(Author, PackageName)
    else
        Link = string.format(BASEURL .. "/packages/%s/%s/v%s", Author, PackageName, Version)
    end

    local FolderName = RuntimePath .. string.format("/Cache/Dependencies/%s/", PackageName)

    local _, PackageData = Request.Json("GET", Link)
    FS.mkdirSync(FolderName)
    FS.writeFileSync(FolderName .. "/Package.json", Json.encode(PackageData, {indent = true}))


    if PackageData.type == "tree" then
        DownloadTree(FolderName, BASEURL .. PackageData.url)
    elseif PackageData.type == "blob" then
        local _, Data = Request.Raw("GET", "https://lit.luvit.io" .. PackageData.url)
        Logger.Info("Downloading " .. PackageData.name .. " to init.lua")
        FS.writeFileSync(FolderName .. "init.lua", Data)
    else
        Logger.Error("Unknown package type: " .. PackageData.type)
    end

    Logger.Info()

    for Index, Dep in pairs(PackageData.dependencies or {}) do
        FetchPackage(Dep)
    end


end

return FetchPackage