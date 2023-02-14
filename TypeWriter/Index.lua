print("Hi from lua")

local FS = require("js").global.process.mainModule:require("fs")

--p(require("js").global.process.mainModule:require("discord.js"))

do -- Set globals
    _G.TypeWriter = require("js").global.TypeWriter
    _G.p = function (T)
        return require("js").global.console:log(T)
    end
    local OriginalRequire = require
    _G.require = function (Module)
        if Module == "js" then
            return OriginalRequire("js")
        elseif  then
        end
    end
end

p(FS)