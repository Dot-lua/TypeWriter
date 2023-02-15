const LuaHelper = require("./Lib/LuaHelper")

//Create lua scope
{
    global.TypeWriter = {}
    global.TypeWriterLuaState = LuaHelper.CreateState()
}

TypeWriter.OS = process.platform

LuaHelper.LoadFile(TypeWriterLuaState, require("path").join(__dirname, "/Index.lua"))