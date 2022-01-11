local Request = require("LIT/Request")
local Logger = require("Logger")
local Json = require("json")
local SemVer = require("semver")

p(SemVer)
return function (Author, Name)
    
    p(string.format("https://lit.luvit.io/packages/%s/%s", Author, Name))
    local Response, Data = Request.Json("GET", string.format("https://lit.luvit.io/packages/%s/%s", Author, Name))
    p(Data)

    print(Json.encode(Data, {indent=true}))

    for i, v in pairs(Data) do print(i, v) end

    p(
        SemVer.gte(
            "1.0.0",
            "0.0.1"
        )
    )

end