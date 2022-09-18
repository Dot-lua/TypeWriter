local Request = require("coro-http").request

local Json = require("json")
local function JsonRequest(Method, Url, Headers, Body, Settings)
    local Response, Body = Request(Method, Url, Headers, Body, Settings)
    return Response, Json.decode(Body)
end

return {
    Request = Request,
    JsonRequest = JsonRequest
}