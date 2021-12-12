local Logger = require("Logger")
local Http = require("coro-http")
local Json = require("json")
local FS = require("fs")

function GetLatest(RepoName)
    local ResponseData, RawData = Http.request("GET", "https://api.github.com/repos/" .. RepoName .. "/releases", {{"user-agent", "TypeWriter updater"}})
    local UnpackedData = Json.decode(RawData)

    return UnpackedData[1].tag_name
end

return function(Args)

    Logger.Info("Loading...")

    local CurrentTag = FS.readFileSync(RuntimePath .. "/Config/Version.dont_change")

    local Response, RawData = Http.request("GET", "https://api.github.com/repos/Dot-Lua/TypeWriter/releases", {{"user-agent", "typewriter"}})
    local Data = Json.decode(RawData)

    local RemoteTag = Data[1].tag_name

    Logger.Info("Remote tag is  " .. RemoteTag)
    Logger.Info("Current tag is " .. CurrentTag)


    if CurrentTag ~= RemoteTag then
        Logger.Info("Updating in 5 seconds")
        require("timer").sleep(5000)
        local Response, Body = Http.request("GET", require(RuntimePath .. "/Actions/Update/GetLatest.lua")("Dot-Lua/TypeWriterInstaller", "TypeWriter-Installer.exe"))

        local TempPath

        if RuntimeOS == "Windows" then
            TempPath = _G.process.env.TEMP
            TempName = TempPath .. "/TW-Installer.exe"
        elseif RuntimeOS == "Mac" then
            TempPath = _G.process.env.TMPDIR
        end

        FS.writeFileSync(TempName, Body)


        require(RuntimePath .. "/deps/coro-spawn")(
            "cmd.exe",
            {
                args = {
                    "/k " .. TempName
                },
                detached = true,
                hide = false,
                stdio = {true, true, true}
            }
        )

        process:exit()
    else
        Logger.Info("You are running the latest release!")
    end


    

end