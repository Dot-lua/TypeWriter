coroutine.wrap(function ()
    
    _G.process = require('process').globalProcess()
    local Os = require("los").type()
    local FS = require("fs")
    local Spawn = require("coro-spawn")
    local Random = require("Random")

    local function InstallLocation()
        local Locations = {
            ["win32"] = (process.env.APPDATA or "") .. "\\.TypeWriter\\",
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

    p("Hello")

    local TempLocation = InstallLocation() .. "/Temp/" .. Random(30) .. "/"
    FS.mkdirSync(TempLocation)
    FS.writeFileSync(TempLocation .. "Pkg.twr", require("luvi").bundle.readfile("/pkg.twr"))

    local Result, Error = Spawn(
        InstallLocation() .. "/TypeWriter.exe",
        {
            args = {
                "execute",
                "-i=" .. TempLocation .. "Pkg.twr",
                "--exe=true"
            }
        }
    )

    p(Error)
    if Error then 
        error(Error)
    end

    coroutine.wrap(function ()
        p("a")
        for Message in Result.stdout.read do
            print(Message)
        end
    end)()

    coroutine.wrap(function ()
        for Message in Result.stderr.read do
            print(Message)
        end
    end)()

    Result.waitExit()
    p(Result.stdout.read())

end)()