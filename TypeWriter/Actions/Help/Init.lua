local Logger = require("Logger")

return function(Args)
    Logger.Info("Usage: TypeWriter [options] script.lua [arguments]")
    print()

    Logger.Info("Options:")
    for i, v in pairs(RuntimeGlobal.Arguments) do
        Logger.Info("-" .. i .. ", --" .. v)
    end
end