const FS = require("fs-extra")
const FSHelpers = require("./Lib/FSHelpers")
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
TypeWriter.Folder = FSHelpers.FindUp(Path.resolve(process.argv0, "../"), "InstallationDirectory", 40) || Path.resolve(`${process.argv0}/../`)
TypeWriter.Executable = process.execPath
TypeWriter.ApplicationData = `${TypeWriter.Folder}/ApplicationData/`
//Other
TypeWriter.Logger = require("./Lib/Logger")
TypeWriter.OriginalRequire = Module.prototype.require
TypeWriter.PackageManagers = require("./Lib/PackageManagers/Index.js")

async function Main() {
    //Check if valid install
    const Installer = require("./Installer/Index.js")
    if (FS.existsSync(`${TypeWriter.Folder}/InstallationDirectory`)) {
        TypeWriter.Logger.Debug("Valid installation found, Trying postinstall scripts")
        await Installer.PostInstall()
    } else {
        TypeWriter.Logger.Information("Invalid install found")
        await Installer.Install()
        process.exit(0)
    }

    //Create folders in Exe folder
    FS.ensureDirSync(TypeWriter.ApplicationData)
    FS.ensureDirSync(`${TypeWriter.Folder}/Binaries/`)
    FS.ensureDirSync(`${TypeWriter.Folder}/Cache/`)
    FS.ensureDirSync(`${TypeWriter.Folder}/Cache/BuildCache/`)
    FS.ensureDirSync(`${TypeWriter.Folder}/Cache/ExecuteCache/`)
    FS.ensureDirSync(`${TypeWriter.Folder}/Cache/ModuleCache/`)
    FS.ensureDirSync(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/`)
    FS.ensureDirSync(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/Modules/`)
    FS.ensureDirSync(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/ModuleTars/`)
    FS.ensureDirSync(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/Unpack/`)
    FS.ensureDirSync(`${TypeWriter.Folder}/Cache/ModuleCache/LIT/`)

    //Run action
    if (TypeWriter.Arguments.action) {
        const Actions = require("./Actions/List.js")
        const Action = Actions[TypeWriter.Arguments.action]
        await Action.Execute()
    } else {
        ArgumentData.Parser.print_help()
    }
}

Main()