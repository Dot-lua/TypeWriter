local FS = require("FS")
local Logger = require("Logger.lua")
local Split = require("Split")

return function (Name)
    if FS.existsSync(RuntimePath .. "/Cache/Dependencies/" .. Name) then return end

    local Author = Split(Name, "/")[1]
    local PackageName = Split(Name, "/")[2]
    local Version = Split(Name, "@")[2] or ""
    
    p(Author)
    p(PackageName)
    p(Version)

    if Version == "" then
        Version = require("LIT/GetLatest")(Author, PackageName)
    end


end