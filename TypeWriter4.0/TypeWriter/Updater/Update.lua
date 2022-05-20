local function FindTableWithKey(SearchTable, Key, Value)
    for Index, TableValue in pairs(SearchTable) do
        if TableValue[Key] == Value then
            return TableValue
        end
    end
end

return function (Release)
    TypeWriter.Logger.Info()
    TypeWriter.Logger.Info("Downloading new version " .. Release.tag_name)
    p(Release)

    local FileNames = {
        ["darwin"] = "MacOs.zip",
        ["linux"] = "Linux.zip",
        ["win32"] = "Windows.zip"
    }

    local Asset = FindTableWithKey(Release.assets, "name", FileNames[TypeWriter.Os])
    p(Asset)

    if Asset == nil then
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
    print(Data)
end