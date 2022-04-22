return function (Name, FileName)
    local Http = require("coro-http")
    local Json = require("json")
    local ProgressBar = require("ProgressBar")

    local Response, Body = Http.request(
        "HEAD",
        string.format(
            "https://github.com/%s/releases/latest/download/%s",
            Name,
            FileName
        ),
        {
            {"user-agent", "typewriter-installer"}
        }
    )

    
    local Response, Body = Http.request(
        "HEAD",
        Response[6][2],
        {
            {"user-agent", "typewriter-installer"}
        },
        nil,
        {followRedirects = true}
    )

    

    return Response[6][2]

    
end