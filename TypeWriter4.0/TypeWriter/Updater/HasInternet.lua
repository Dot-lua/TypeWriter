local Request = require("/Installer/Request").Request

return function ()
    
    local Success, Response = pcall(Request, "GET", "https://github.com/Dot-lua/TypeWriter")

    if not Success then
        return false
    end

    if Response.statusCode ~= 200 then
        return false
    end
    return true
end