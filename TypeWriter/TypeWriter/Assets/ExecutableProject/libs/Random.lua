local Characters = {}

local BaseString = "ABCDEFZHIKLMNOPQRSTVX1234567890"

local function RandomString(Length)
    math.randomseed(os.time() ^ 5)

    local Generated = ""

    for i = 0, Length do
        local ThisRandom = math.random(#BaseString)
        local Lower = math.random(1, 3) ~= 1

        local Letter = string.sub(BaseString, ThisRandom, ThisRandom)
        
        local LetterOut = Letter

        if Lower then
            LetterOut = string.lower(Letter)
        end

        Generated = Generated .. LetterOut
    end

    return Generated

end

return RandomString