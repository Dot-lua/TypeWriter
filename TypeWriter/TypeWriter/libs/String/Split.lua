return function(TheString, Decr)
    Lines = {}
    for s in string.gmatch(TheString, "[^" .. Decr .. "]+") do
        table.insert(Lines, s)
    end
    return Lines
end