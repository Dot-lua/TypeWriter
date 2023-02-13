const LuaHelper = require("./Lib/LuaHelper")

//Create lua scope
global.TypeWriter = {}
{
    
    global.TypeWriterLuaState = LuaHelper.CreateState()
}

LuaHelper.LoadFile(TypeWriterLuaState, require("path").join(__dirname, "/Index.lua"))