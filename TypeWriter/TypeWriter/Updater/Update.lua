local function FindTableWithKey(SearchTable, Key, Value)
    for Index, TableValue in pairs(SearchTable) do
        if TableValue[Key] == Value then
            return TableValue
        end
    end
end

local FS = require("fs")

return function (Release)
    TypeWriter.Logger.Info()
    TypeWriter.Logger.Info("Downloading new version " .. Release.tag_name)

    local OsNames = {
        win32 = "Windows",
        darwin = "Darwin",
        linux = "Linux"
    }

    local FileName = string.format(
        "TypeWriter-%s-%s.tar.gz",
        OsNames[TypeWriter.OS],
        require("uv").os_uname().machine
    )

    local Asset = FindTableWithKey(Release.assets, "name", FileName)

    if Asset == nil then
        TypeWriter.Logger.Error("A new release was found but no asset was found for this platform")
        TypeWriter.Logger.Error("This could be because the release was just published")
        TypeWriter.Logger.Error("If this error persists, please update manually")
        TypeWriter.Logger.Error("https://github.com/Dot-lua/TypeWriter/releases")
        return
    end

    TypeWriter.Logger.Info("Downloading " .. Asset.browser_download_url .. " (" .. Asset.size .. " bytes)")

    local Response, Data = require("../Installer/Request").Request(
        "GET",
        Asset.browser_download_url,
        {
            {"User-Agent", "TypeWriter Updater"}
        }
    )

    local Paths = {
        ["win32"] = process.env.TEMP,
        ["darwin"] = process.env.TMPDIR,
        ["linux"] = process.env.TMPDIR
    }
    local TempPath = Paths[TypeWriter.Os] .. "/TypeWriter.zip"
    FS.writeFileSync(TempPath, Data)
    require("../Installer/Unzip")(TempPath, Paths[TypeWriter.Os])
    if TypeWriter.Os == "darwin" then
        require("../Installer/Unzip")(Paths[TypeWriter.Os] .. "/TypeWriter.tar", Paths[TypeWriter.Os])
    end

    local InstallOverWrite
    if FS.existsSync(TypeWriter.Folder .. "/DevEnv") == false then
        InstallOverWrite = TypeWriter.Folder
    end

    local Result, Error = require("coro-spawn")(
        Paths[TypeWriter.Os] .. "/TypeWriter" .. (({["win32"] = ".exe"})[TypeWriter.Os] or ""),
        {
            detached = false,
            hide = false,
            args = {
                InstallOverWrite
            }
        }
    )
    process:exit()
end