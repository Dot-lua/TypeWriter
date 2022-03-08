return function(TheString, Decr)
    Lines = {}
    for s in TheString:gmatch("[^" .. Decr .. "]+") do
        table.insert(Lines, s)
    end
    return Lines
end