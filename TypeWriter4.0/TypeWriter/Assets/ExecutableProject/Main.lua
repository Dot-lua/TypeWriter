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
        InstallLocation() .. "/TypeWriter",
        {
            args = {
                "execute",
                "-i=" .. TempLocation .. "Pkg.twr",
                "--exe=true"
            }
        }
    )
    p(1)
    p(Result)
    p(Error)
    if Error then 
        error(Error)
    end
    p(2)

    coroutine.wrap(function ()
        for Message in Result.stdout.read do
            print("Ms")
            print(Message)
        end
    end)()
    p(3)

    coroutine.wrap(function ()
        for Message in Result.stderr.read do
            print(Message)
        end
    end)()
    p(4)


    Result.waitExit()
    p(5)

    --p(Result.stdout:read())
    --p(6)
--
    --p(Result.stderr:read())
    --p(7)

    p("done")

end)()