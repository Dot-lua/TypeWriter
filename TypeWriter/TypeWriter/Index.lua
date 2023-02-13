print("Hi from lua")

--p(require("js").global.process.mainModule:require("discord.js"))

do -- Set globals
    _G.TypeWriter = require("js").global.TypeWriter
    _G.p = function (T)
        return require("js").global.console:log(T)
    end
    --local OriginalRequire = require
    --_G.require = function (Module)
    --    
    --end
end

p("hi")
p(process)