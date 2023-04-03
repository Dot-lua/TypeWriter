local FS = js.global.process.mainModule:require("fs")

do -- Set globals
    _G.TypeWriter = js.global.TypeWriter
    _G.p = function (T)
        return js.global.console:log(T)
    end
    
    local OriginalRequire = require
    
    js.Global = js.global
    js.LoadFile = function (P)
        return js.global.process.mainModule:require(P)
    end
    js.LoadString = function (S, P)
        local F = js.global.process.mainModule:require("require-from-string")
        return F(F, S, P)
    end
    js.Load = js.LoadString

    _G.Js = js
    _G.JS = js
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