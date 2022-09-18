local Logger = require("Logger")
local Json = require("json")
local Request = require("coro-http").request

local P = {}

function P.Raw(Method, Url, Headers, Body)
    local Response, Data = Request(Method, Url, Headers, Body)

    if Response.code ~= 200 then
        Logger.Warn("Got code " .. Response.code .. " while requesting " .. Url)
        return P.Raw(Method, Url, Headers, Body)
    end

    return Response, Data
end

function P.Json(Method, Url, Headers, Body)
    local Response, Data = P.Raw(Method, Url, Headers, Body)
    return Response, Json.decode(Data)
end

return P