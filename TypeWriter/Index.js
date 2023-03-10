const LuaHelper = require("./Lib/LuaHelper")
const FS = require("fs")

global.TypeWriter = {}
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
    CreateDir(`${TypeWriter.Folder}/Cache/ExecuteCache/`)
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/`)
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/`)
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/LIT/`)
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/Unpack/`)
}

