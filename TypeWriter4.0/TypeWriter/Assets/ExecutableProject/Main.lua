coroutine.wrap(function ()
    
    _G.process = require('process').globalProcess()
    local Os = require("los").type()
    local FS = require("fs")
    local Spawn = require("coro-spawn")
    local Random = require("Random")
    local Json = require("json")
    local Base = require("base64")
    local QueryString = require("querystring")

    local function InstallLocation()
        local Locations = {
            ["win32"] = "C:/Users/Thijmen/Documents/Github/Dot-Lua/TypeWriter/TypeWriter4.0/", -- (process.env.APPDATA or "") .. "\\.TypeWriter\\",
            ["darwin"] = (process.env.HOME or "") .. "/Library/Application Support/TypeWriter/"
        }
    
        return Locations[Os]
    end

    local function IsInstalled()
        return FS.existsSync(InstallLocation())
    end

    if IsInstalled() == false then
        error("Typewriter is not installed, please install from https://github.com/Dot-lua/TypeWriter/releases")
    end

    local TempLocation = InstallLocation() .. "/Temp/" .. Random(30) .. "/"
    FS.mkdirSync(TempLocation)
    FS.writeFileSync(TempLocation .. "Pkg.twr", require("luvi").bundle.readfile("/pkg.twr"))

    local ExeName = process.argv[0]
    process.argv[0] = nil

    local Result, Error = Spawn(
        InstallLocation() .. "/TypeWriter",
        {
            args = {
                "execute",
                "-i=" .. TempLocation .. "Pkg.twr",
                "--isexe=true",
                "--exearg=" .. QueryString.urlencode(Base.encode(Json.encode(process.argv))),
                "--exename=" .. ExeName
            },
            stdio = {
                process.stdin.handle,
                process.stdout.handle,
                process.stderr.handle
            }
        }
    )

    if Error then 
        error(Error)
    end

    Result.waitExit()
end)()
require("uv").run()