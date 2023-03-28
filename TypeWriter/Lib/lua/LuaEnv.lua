local FS = js.global.process.mainModule:require("fs")

do -- Set globals
    _G.TypeWriter = js.global.TypeWriter
    _G.p = function (T)
        return js.global.console:log(T)
    end
    
    local OriginalRequire = require
    
    _G.jsnew = js.new
    _G.JsNew = jsnew
end

do
    _G.Sleep = function (Time)
        js.global:Sleep(Time)
    end

    _G.Wait = function (Time)
        js.global:Wait(Time)
    end
end

do -- Proxy functions
    _G.Import = function(Request)
        return TypeWriter:Import(Request)
    end
end