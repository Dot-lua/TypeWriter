local Package = require("../package")
p(Package)
return function ()
    if not require("./HasInternet")() then
        return
    end

    if require("./GetLatestRelease")() == Package.version then
        p("This is latest")
        return
    end
end