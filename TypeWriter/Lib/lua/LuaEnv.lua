local FS = js.global.process.mainModule:require("fs")

do -- Set globals
    _G.TypeWriter = js.global.TypeWriter
    _G.p = function (T)
        return js.global.console:log(T)
    end
    
    p(Import)
    local OriginalRequire = require
    
    _G.jsnew = js.new
    _G.JsNew = jsnew
end

do -- Require Fix
    _G.require = function (Module)
        if Module == "js" then
            return js
        end

        --local M = OriginalRequire(Module)
        --if M then
        --    return M
        --end

        local S, M = pcall(
            function ()
                return js.global.process.mainModule:require("./Lib/RequireHelper.js"):RequireHelper(Module)
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
end

do -- Proxy functions
    _G.Import = function(Request)
        return TypeWriter:Import(Request)
    end
end