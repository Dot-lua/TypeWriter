const FS = require("fs")
const Path = require("path")

const ArgumentData = require("./Registry/Arguments")

global.TypeWriter = {}
TypeWriter.OS = process.platform
TypeWriter.Arguments = ArgumentData.Arguments
TypeWriter.Folder = require("./Lib/FindUp")(Path.resolve(process.argv0, "../"), "InstallationDirectory")
TypeWriter.Executable = Path.resolve(`${TypeWriter.Folder}/TypeWriter${TypeWriter.OS == "win32" ? ".exe" : ""}`)
TypeWriter.ApplicationData = `${TypeWriter.Folder}/ApplicationData/`
TypeWriter.Logger = require("./Lib/Logger")

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
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/LIT/`)
    CreateDir(`${TypeWriter.Folder}/Cache/ModuleCache/Unpack/`)
}

if (TypeWriter.Arguments.action) {
    require(`./Actions/List.js`)[TypeWriter.Arguments.action].Execute()
} else {
    ArgumentData.Parser.print_help()
}