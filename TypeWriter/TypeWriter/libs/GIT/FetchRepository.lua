local Spawn = require("coro-spawn")
local FS = require("fs")
local Lit = require("LIT/FetchPackage")

return function (Name)
    local Author = string.split(Name, "/")[1]
    local Repository = string.split(string.split( Name, "/")[2], "@")[1]
    local Branch = string.split(string.split(Name, "/")[2], "@")[2]

    if FS.existsSync(TypeWriter.Folder .. "/PackageCache/" .. Repository) then
        return
    end

    TypeWriter.Logger.Info("Downloading " .. Name)

    local Arguments = {
        "clone",
        "https://github.com/" .. Author .. "/" .. Repository
    }

    if Branch then
        table.insert(Arguments, "-b")
        table.insert(Arguments, Branch)
    end


    local Result, Error = Spawn(
        "git",
        {
            cwd = TypeWriter.Folder .. "/PackageCache/",
            args = Arguments
        }
    )
    Result.waitExit()

    if FS.existsSync(TypeWriter.Folder .. "/PackageCache/" .. Repository) then
        TypeWriter.Logger.Info("Downloaded " .. Name)

        if FS.existsSync(TypeWriter.Folder .. "/PackageCache/" .. Repository .. "/package.lua") then
            
            local DownloadedPackage = load(
                FS.readFileSync(
                    TypeWriter.Folder .. "/PackageCache/" .. Repository .. "/package.lua"
                )
            )()

            if DownloadedPackage.dependencies == nil then DownloadedPackage.dependencies = {} end

            for Index, Dep in pairs(DownloadedPackage.dependencies) do
                Lit(Dep)
            end
        end
    else
        TypeWriter.Logger.Error("Failed to download " .. Name)
    end
end