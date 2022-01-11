local Request = require("LIT/Request")
local Logger = require("Logger")
local Json = require("json")
local SemVer = require("semver")

return function (Author, Name)
    
    local Response, Data = Request.Json("GET", string.format("https://lit.luvit.io/packages/%s/%s", Author, Name))

    local Latest = "0.0.0"

    for Version, Link in pairs(Data) do
        if SemVer.gte(Latest, Version) then
        else
            Latest = Version
        end
    end

    return Latest, Data[Latest]

end