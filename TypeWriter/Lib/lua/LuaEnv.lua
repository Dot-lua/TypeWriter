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
        local Current = coroutine.running()
        local Promise = js.global:Sleep(Time)
        Promise["then"](Promise, function() assert(coroutine.resume(Current)) end)
        coroutine.yield()
    end

    _G.Wait = function (Time)
        local Current = coroutine.running()
        local Promise = js.global:Wait(Time)
        Promise["then"](Promise, function() assert(coroutine.resume(Current)) end)
        coroutine.yield()
    end
end

do -- Proxy functions
    _G.Import = function(Request)
        return TypeWriter:Import(Request)
    end
end