local JsonRequest = require("../Installer/Request").JsonRequest

return function ()
    local Response, Data = JsonRequest(
        "GET",
        "https://api.github.com/repos/Dot-Lua/TypeWriter/releases?per_page=10",
        {
            {"User-Agent", "TypeWriter"}
        }
    )
    return Data
end