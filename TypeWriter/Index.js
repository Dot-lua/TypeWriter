const LuaHelper = require("./Lib/LuaHelper")

//Create lua scope
{
    global.TypeWriter = {}
    global.TypeWriterLuaState = LuaHelper.CreateState()
}

TypeWriter.OS = process.platform
TypeWriter.Arguments = require("./Registry/Arguments")

console.log(TypeWriter.Arguments)

LuaHelper.LoadFile(TypeWriterLuaState, require("path").join(__dirname, "/Index.lua"))