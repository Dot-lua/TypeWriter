print("Hi from lua")

local FS = require("js").global.process.mainModule:require("fs")




do -- Set globals
    _G.TypeWriter = require("js").global.TypeWriter
    _G.p = function (T)
        return require("js").global.console:log(T)
    end
    local OriginalRequire = require
    _G.require = function (Module)
        if Module == "js" then
            return OriginalRequire("js")
        end

        --local M = OriginalRequire(Module)
        --if M then
        --    return M
        --end

        

        local S, M = pcall(
            function ()
                return-- OriginalRequire("js").global.process.mainModule:require(Module)
            end
        )
        if M then
            return M
        end

        local SnapshotFolder
        if TypeWriter.OS == "win32" then
            SnapshotFolder = "C:\\snapshot\\TypeWriter\\"
        else
            SnapshotFolder = "/snapshot/TypeWriter/"
        end

        if FS:existsSync(SnapshotFolder .. Module) then
            return load(FS:readFileSync(SnapshotFolder .. Module))
        end

    end
    _G.jsnew = require("js").new
    _G.JsNew = jsnew
end

do
    print(package.path)
    local Pre
    if TypeWriter.OS == "win32" then
        Pre = "C:\\snapshot\\TypeWriter\\"
    else
        Pre = "/snapshot/TypeWriter/"
    end
    package.path = string.format("%s?%s", Pre, package.config:sub(3, 3)) .. package.path
    print(package.path)
end

for key, value in pairs(FS:readdirSync("C:/snapshot/TypeWriter/Registry/")) do
    print(key, value)
end

_G.TypeWriter.Arguments = require("Registry/Arguments.lua")
print(_G.TypeWriter.Arguments)