

//Create lua scope
global.TypeWriter = {}
{
    
    global.TypeWriterLuaState = L
}

let luaCode = require("fs").readFileSync(module.path + "/Index.lua", "utf-8")
{
    
}