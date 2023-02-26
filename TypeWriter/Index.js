const LuaHelper = require("./Lib/LuaHelper")
const FS = require("fs")

//Create lua scope
{
    global.TypeWriter = {}
    global.TypeWriterLuaState = LuaHelper.CreateState()
}

TypeWriter.OS = process.platform
TypeWriter.Arguments = require("./Registry/Arguments")
TypeWriter.Executable = process.argv[0]
TypeWriter.Folder = require("path").resolve(TypeWriter.Executable, "../")
TypeWriter.ApplicationData = `${TypeWriter.Folder}/ApplicationData/`
TypeWriter.Logger = require("./Lib/Logger")

{ //Create folders in Exe folder
    function CreateDir(DirPath) {
        if (FS.existsSync(DirPath)) {return}
        FS.mkdirSync(DirPath)
    }
    CreateDir(TypeWriter.ApplicationData)
    CreateDir(`${TypeWriter.Folder}/Cache/`)
    CreateDir(`${TypeWriter.Folder}/Cache/BuildCache/`)
    CreateDir(`${TypeWriter.Folder}/Cache/RunCache/`)
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/`)
}

TypeWriter.Logger.Debug("Hello")
TypeWriter.Logger.Info("Hello")
TypeWriter.Logger.Warn("Hello")
TypeWriter.Logger.Error("Hello")

console.log(TypeWriter.Arguments)
LuaHelper.LoadFile(TypeWriterLuaState, require("path").join(__dirname, "/Index.lua"))

require(`./Actions/List.js`)[TypeWriter.Arguments.action].Execute()