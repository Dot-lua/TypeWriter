local FS = require("fs")
local OS = require("los").type()
local Request = require("coro-http").request
local Json = require("json")
local Bundle = require("luvi").bundle

local function InstallLocation()
    local Locations = {
        ["win32"] = (process.env.APPDATA or "") .. "\\.TypeWriter\\",
        ["darwin"] = (process.env.HOME or "") .. "/Library/Application Support/TypeWriter/"
    }

    return Locations[OS]
end

local function JsonRequest(Method, Url, Headers, Body, Settings)
    local Response, Body = Request(Method, Url, Headers, Body, Settings)
    return Response, Json.decode(Body)
end

TypeWriter.Logger.Info("Currently running at " .. TypeWriter.Here)
TypeWriter.Logger.Info("Currently running " .. TypeWriter.This)

if FS.existsSync(InstallLocation()) then
    TypeWriter.Logger.Info("Removing old installation...")
    TypeWriter.Logger.Info("Deleting folder " .. InstallLocation())
    --require("timer").sleep(3000)
    require("coro-fs").rmrf(InstallLocation())
end

FS.mkdirSync(InstallLocation())
FS.writeFileSync(InstallLocation() .. "/SessionStorage", "0")

local FileNames = {
    ["win32"] = "TypeWriter.exe",
    ["darwin"] = "TypeWriter"
}

FS.writeFileSync(InstallLocation() .. "/" .. FileNames[OS], FS.readFileSync(TypeWriter.This))

FS.mkdirSync(InstallLocation() .. "/Binary/")
FS.mkdirSync(InstallLocation() .. "/Config/")

FS.writeFileSync(InstallLocation() .. "/Config/Compiler.json", Bundle.readfile("Installer/Config/Compiler.json"))
FS.writeFileSync(InstallLocation() .. "/Config/DeveloperMode.json", Bundle.readfile("Installer/Config/DeveloperMode.json"))


local function GetLatestGithubRelease(Name)
    local Response, Body = Request(
        "GET",
        string.format(
            "https://api.github.com/repos/%s/releases?per_page=1",
            Name
        ),
        {
            {"User-Agent", "TypeWriter"}
        }
    )
    local DecodedResponse = Json.decode(Body)

    return DecodedResponse[1]
end

local function FindTableWithKeyValue(Table, Key, Value)
    for Index, Item in pairs(Table) do
        if Item[Key] == Value then
            return Item
        end
    end
end

local LuvitInstall = {
    ["win32"] = function (Release)

        local Response, Body = Request(
            "GET",
            FindTableWithKeyValue(Release.assets, "name", "luvit-bin-Windows-x86_64.zip").browser_download_url,
            {
                {"User-Agent", "TypeWriter"}
            }
        )

        FS.writeFileSync(InstallLocation() .. "/Binary/luvit-bin.zip", Body)

        require("./Unzip")(InstallLocation() .. "/Binary/luvit-bin.zip", InstallLocation() .. "/Binary/")
    end,
    ["darwin"] = function (Release)

        local Response, Body = Request(
            "GET",
            FindTableWithKeyValue(Release.assets, "name", "luvit-bin-Darwin-x86_64.tar.gz").browser_download_url,
            {
                {"User-Agent", "TypeWriter"}
            }
        )

        FS.writeFileSync(InstallLocation() .. "/Binary/luvit-bin.tar.gz", Body)

        require("./Unzip")(InstallLocation() .. "/Binary/luvit-bin.tar.gz", InstallLocation() .. "/Binary/")
    end
}

local Release = GetLatestGithubRelease("truemedian/luvit-bin")
TypeWriter.Logger.Info("Downloading truemedian/luvit-bin version " .. Release.name)
LuvitInstall[OS](Release)
TypeWriter.Logger.Info("Download complete")

FS.mkdirSync(InstallLocation() .. "/ApplicationData/")

FS.mkdirSync(InstallLocation() .. "/Internal/")

local _, PackageMeta = JsonRequest(
    "GET",
    "https://raw.githubusercontent.com/Dot-lua/Internal-packages/main/Releases/Meta.json",
    {
        {"User-Agent", "TypeWriter"}
    }
)

for Index, Package in pairs(PackageMeta) do
    TypeWriter.Logger.Info("Downloading " .. Package.Name .. " from \"" .. Package.Url .. "\"")
    local Response, Body = Request(
        "GET",
        Package.Url,
        {
            {"User-Agent", "TypeWriter"}
        }
    )
    FS.writeFileSync(InstallLocation() .. "/Internal/" .. Package.Name, Body)
end

local Finish = {
    ["win32"] = function ()
        
        FS.writeFileSync(
            _G.process.env.LOCALAPPDATA .. "/Microsoft/WindowsApps/TypeWriter.bat",
            "@echo off\n" .. _G.process.env.APPDATA .. "/.TypeWriter/TypeWriter.exe %*"
        )

    end,
    ["darwin"] = function ()
        os.execute("chmod +x '" .. InstallLocation() .. "/TypeWriter'")

        local ProfileLocation = process.env.HOME .. "/.bash_profiles"

        local function FindAndInsert(FileLocation, InsertLine)

            if not FS.existsSync(FileLocation) then
                FS.writeFileSync(FileLocation, "")
            end

            local Profile = FS.readFileSync(FileLocation)

            local Found = false
            for Index, Line in pairs(String.Split(Profile, "\n")) do
                if Line == InsertLine then
                    Found = true 
                    break
                end
            end

            FS.writeFileSync(
                FileLocation,
                Profile .. "\n\n" .. InsertLine
            )

            return not Found
        end


        if FindAndInsert(ProfileLocation, 'alias TypeWriter="\'' .. InstallLocation() .. '/TypeWriter\'"') then
            TypeWriter.Logger.Info("Added TypeWriter to your bash profile")
        end

        if FindAndInsert(process.env.HOME .. "/.zshenv", ". ~/.bash_profiles") then 
            TypeWriter.Logger.Info("Added bash profile to your zshrc")
        end
        
    end
}

Finish[OS]()