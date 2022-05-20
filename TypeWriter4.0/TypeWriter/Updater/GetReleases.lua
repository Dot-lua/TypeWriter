local JsonRequest = require("../Installer/Request").JsonRequest

return function ()
    local Response, Data = JsonRequest(
        "GET",
        "https://api.github.com/repos/Dot-Lua/TypeWriter/releases",
        {
            {"User-Agent", "TypeWriter"}
        }
    )
    return Data
end