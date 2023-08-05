
_G.p = function (T)
    TypeWriter.JavaScript.Global.console:log(T)
end

_G.Import = function (P)
    print(P)
    return TypeWriter:ImportAsync(P):await()
end

_G.Sleep = function (T)
    TypeWriter.JavaScript.Global:SleepSync(T)
end

_G.Wait = function (T)
    TypeWriter.JavaScript.Global:WaitSync(T)
end