const FS = require("fs")
const Path = require("path")

const ArgumentData = require("./Registry/Arguments")
const Module = require("module")

global.TypeWriter = {}
//Arguments
TypeWriter.Arguments = ArgumentData.Arguments
TypeWriter.ApplicationArguments = ArgumentData.Unknown
//Os
TypeWriter.OS = process.platform
//File Paths
TypeWriter.Folder = require("./Lib/FindUp")(Path.resolve(process.argv0, "../"), "InstallationDirectory", 40) || Path.resolve(`${process.argv0}/../`)
TypeWriter.Executable = process.execPath
TypeWriter.ApplicationData = `${TypeWriter.Folder}/ApplicationData/`
//Other
TypeWriter.Logger = require("./Lib/Logger")
TypeWriter.OriginalRequire = Module.prototype.require

if (FS.existsSync(`${TypeWriter.Folder}/InstallationDirectory`)) {
    TypeWriter.Logger.Debug("Valid installation found")
} else {
    TypeWriter.Logger.Information("Invalid install found")
    require("./Installer/")
    process.exit(0)
}

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
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/Modules/`)
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/ModuleTars/`)
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/Unpack/`)
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/LIT/`)
}

if (TypeWriter.Arguments.action) {
    const Actions = require("./Actions/List.js")
    const Action = Actions[TypeWriter.Arguments.action]
    Action.Execute()
} else {
    ArgumentData.Parser.print_help()
}