local Package = require("/package")
p(Package)
return function ()
    if not require("./HasInternet")() then
        return
    end
end