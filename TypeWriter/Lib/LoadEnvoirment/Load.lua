
_G.p = function (T)
    TypeWriter.JavaScript.Global.console:log(T)
end

_G.Import = function (P)
    return TypeWriter:Import(P)
end

_G.Sleep = function (T)
    TypeWriter.JavaScript.Global:SleepSync(T)
end

_G.Wait = function (T)
    TypeWriter.JavaScript.Global:WaitSync(T)
end