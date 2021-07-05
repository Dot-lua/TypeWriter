local Logger = require("Logger")

return function()

    local Map = {
        ['win32'] = 'Windows',
        ['linux'] = 'Linux',
        ['darwin'] = 'OSX',
        ['bsd'] = 'BSD',
        ['posix'] = 'POSIX',
        ['other'] = 'Other'
    }

    local OS = Map[require("los").type()]

    local Supported = {
        ["Windows"] = true,
        ["Linux"] = true,
        ["OSX"] = true,
    }

    if not Supported[OS] then
        Logger.Error("Your operating system (" .. OS .. ") is not supported for TypeWriter")
        print()
        Logger.Error("Supported Types Are:")
        for i, v in pairs(Supported) do
            Logger.Error(" - " .. i)
        end

        process:exit()
    end

    return OS

end