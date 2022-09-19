local Request = require("../Installer/Request").Request

return function ()
    
    local Success, Response = pcall(Request, "GET", "https://ping.github.com")

    if not Success then
        return false
    end

    if Response.code ~= 404 then
        return false
    end
    return true
end