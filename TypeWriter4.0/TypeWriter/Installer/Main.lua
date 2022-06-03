local FS = require("fs")
local OS = require("los").type()
local Request = require("./Request").Request
local JsonRequest = require("./Request").JsonRequest
local Json = require("json")
local Bundle = require("luvi").bundle

Sleep(2000)

local function InstallLocation()
    local Locations = {
        ["win32"] = (process.env.APPDATA or "") .. "\\.TypeWriter\\",
        ["darwin"] = (process.env.HOME or "") .. "/Library/Application Support/TypeWriter/"
    }

    return Locations[OS]
end

local IgnoreDelete = {
    ["ApplicationData"] = true,
    ["Config"] = true
}

local Rmrf = require("coro-fs").rmrf
local function ClearFolder()
    local Files = FS.readdirSync(InstallLocation())

    for Index, FileName in pairs(Files) do
        if not IgnoreDelete[FileName] then
            Rmrf(InstallLocation() .. FileName)
        end
    end
end

TypeWriter.Logger.Info("Currently running at " .. TypeWriter.Here)
TypeWriter.Logger.Info("Currently running " .. TypeWriter.This)

if FS.existsSync(InstallLocation()) then
    TypeWriter.Logger.Info("Removing old installation...")
    TypeWriter.Logger.Info("Deleting folder " .. InstallLocation())
    ClearFolder()

    --require("coro-fs").rmrf(InstallLocation())
end

FS.mkdirSync(InstallLocation())
FS.writeFileSync(InstallLocation() .. "/SessionStorage", "0")

local FileNames = {
    ["win32"] = "TypeWriter.exe",
    ["darwin"] = "TypeWriter"
}

TypeWriter.Logger.Info(FS.writeFileSync(InstallLocation() .. "/" .. FileNames[OS], FS.readFileSync(TypeWriter.This)))

FS.mkdirSync(InstallLocation() .. "/Binary/")

if not FS.existsSync(InstallLocation() .. "/Config/") then
    FS.mkdirSync(InstallLocation() .. "/Config/")

    FS.writeFileSync(InstallLocation() .. "/Config/Compiler.json", Bundle.readfile("Installer/Config/Compiler.json"))
    FS.writeFileSync(InstallLocation() .. "/Config/DeveloperMode.json", Bundle.readfile("Installer/Config/DeveloperMode.json"))
end

local BaseUrl = "https://github.com/truemedian/luvit-bin/releases/latest/download/"

local LuvitInstall = {
    ["win32"] = function ()

        local Response, Body = Request(
            "GET",
            BaseUrl .. "luvit-bin-Windows-x86_64.zip",
            {
                {"User-Agent", "TypeWriter"}
            }
        )

        FS.writeFileSync(InstallLocation() .. "/Binary/luvit-bin.zip", Body)

        require("./Unzip")(InstallLocation() .. "/Binary/luvit-bin.zip", InstallLocation() .. "/Binary/")
    end,
    ["darwin"] = function ()

        local Response, Body = Request(
            "GET",
            BaseUrl .. "luvit-bin-Darwin-x86_64.tar.gz",
            {
                {"User-Agent", "TypeWriter"}
            }
        )

        FS.writeFileSync(InstallLocation() .. "/Binary/luvit-bin.tar.gz", Body)

        require("./Unzip")(InstallLocation() .. "/Binary/luvit-bin.tar.gz", InstallLocation() .. "/Binary/")
    end
}

TypeWriter.Logger.Info("Downloading luvit binaries...")
LuvitInstall[OS]()
TypeWriter.Logger.Info("Download complete")

FS.mkdirSync(InstallLocation() .. "/ApplicationData/")

require("./DownloadInternal")(InstallLocation())

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

require("coro-spawn")(
    InstallLocation() .. "/" .. FileNames[OS],
    {}
).waitExit()

Sleep(3000)