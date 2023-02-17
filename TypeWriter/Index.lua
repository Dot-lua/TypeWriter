print("Hi from lua")

local FS = js.global.process.mainModule:require("fs")

for key, value in pairs(package) do
    print(key, value)
end

do -- Set globals
    _G.TypeWriter = js.global.TypeWriter
    _G.p = function (T)
        return js.global.console:log(T)
    end
    local OriginalRequire = require
    _G.require = function (Module)
        if Module == "js" then
            return js
        end

        --local M = OriginalRequire(Module)
        --if M then
        --    return M
        --end

        p(Module)
        local S, M = pcall(
            function ()
                local RequireHelper = OriginalRequire("./Lib/RequireHelper.js")
                RequireHelper("a")
                --return OriginalRequire("js").global.process.mainModule:require(Module)
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
            return load(FS:readFileSync(SnapshotFolder .. Module, "utf8"))()
        end

    end
    _G.jsnew = js.new
    _G.JsNew = jsnew
end


print(require("Registry/Arguments.lua"))
_G.TypeWriter.Arguments = require("Registry/Arguments.lua")
print(_G.TypeWriter.Arguments)
print("a")