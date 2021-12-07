function PrintBar(Percent, Name, Stage, Length)
    local LoadedLength = math.floor((Length / 100) * Percent)
    local Bar = ""

    for Index = 1, Length do
        if Index <= LoadedLength then
            Bar = Bar .. "#"
        else
            Bar = Bar .. "-"
        end
    end

    _G.process.stdout.handle:write(
        string.format(
            "\r%s: [%s](%s%%)(%s)",
            Name,
            string.format("\27[%im", 36) .. Bar .. "\27[0m",
            Percent,
            Stage
        )
    )

    if Percent == 100 then
        _G.process.stdout.handle:write("\n")
    end
end

return PrintBar