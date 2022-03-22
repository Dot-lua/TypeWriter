local ArgumentParser = Class:extend()

function ArgumentParser:initialize(Arguments)
    self.Arguments = Arguments
    self.Short = {}
    self.Long = {}
end

function ArgumentParser:Parse()
    for Index, Argument in pairs(self.Arguments) do
        if string.sub(Argument, 1, 2) == "--" then
            local Split = String.Split(
                string.sub(Argument, 3),
                "="
            )
            local Name = Split[1]
            local Rest = Table.concat(Split, "=", 2) or true
            self.Long[Name] = Rest
        elseif string.sub(Argument, 1, 1) == "-" then
            local Split = String.Split(
                string.sub(Argument, 2),
                "="
            )
            local Name = Split[1]
            local Rest = Table.concat(Split, "=", 2) or true
            self.Short[Name] = Rest
        end
    end

    return self
end

function ArgumentParser:GetRaw(Index)
    return self.Arguments[Index]
end

function ArgumentParser:GetArgument(Long, Short, Default)
    return self.Short[Short] or self.Long[Long] or Default
end

return ArgumentParser