const FS = require("fs-extra")
const FSHelpers = require("./Lib/FSHelpers")
const Path = require("path")

const Logger = require("./Classes/Logger.js")
const DepencencyManager = require("./Classes/DependencyManager/Index.js")
const PackageManager = require("./Classes/PackageManager.js")

class TypeWriter {
    constructor() {
        this.ArgumentData = require("./Registry/Arguments")
        this.Arguments = this.ArgumentData.Arguments
        this.ApplicationArguments = this.ArgumentData.Unknown

        this.OS = process.platform
        this.OriginalRequire = require("module").prototype.require

        this.InstallationFolder = FSHelpers.FindUp(Path.resolve(process.argv0, "../"), "InstallationDirectory", 40) || Path.resolve(`${process.argv0}/../`)
        this.ApplicationData = Path.normalize(`${this.InstallationFolder}/ApplicationData/`)
        this.Executable = process.execPath

        this.Logger = this.CreateLogger("TypeWriter")
        this.DependencyManager = new DepencencyManager()
        this.PackageManager = new PackageManager()

        this.Actions = require("./Actions/List.js")
    }

    CreateLogger(LoggerName) {
        return new Logger(LoggerName)
    }
    
    RunAction(ActionName) {
        if (!ActionName && !this.Arguments.action) {
            return false
        } else {
            ActionName = this.Arguments.action
        }

        const Action = this.Actions[ActionName]
        if (!Action) {
            this.Logger.Error(`Action '${ActionName}' not found`)
            process.exit(1)
        }

        Action.Execute()
        return true
    }
    
    ShowHelp() {
        this.ArgumentData.Parser.print_help()
    }

    CreateFolders() {
        this.Folders = {
            BinariesFolder: `${this.InstallationFolder}/Binaries/`,
            CacheFolder: `${this.InstallationFolder}/Cache/`,
            Cache: {
                BuildCacheFolder: `${this.InstallationFolder}/Cache/BuildCache/`,
                ExecuteCacheFolder: `${this.InstallationFolder}/Cache/ExecuteCache/`,
                ModuleCacheFolder: `${this.InstallationFolder}/Cache/ModuleCache/`,
                ModuleCache: {
                    NPMFolder: `${this.InstallationFolder}/Cache/ModuleCache/NPM/`,
                    NPM: {
                        ModulesFolder: `${this.InstallationFolder}/Cache/ModuleCache/NPM/Modules/`,
                        ModuleTarsFolder: `${this.InstallationFolder}/Cache/ModuleCache/NPM/ModuleTars/`,
                        UnpackFolder: `${this.InstallationFolder}/Cache/ModuleCache/NPM/Unpack/`
                    },
                    LITFolder: `${this.InstallationFolder}/Cache/ModuleCache/LIT/`
                }
            }
        }

        FS.ensureDirSync(this.ApplicationData)
        FS.ensureDirSync(this.Folders.BinariesFolder)
        FS.ensureDirSync(this.Folders.CacheFolder)
        FS.ensureDirSync(this.Folders.Cache.BuildCacheFolder)
        FS.ensureDirSync(this.Folders.Cache.ExecuteCacheFolder)
        FS.ensureDirSync(this.Folders.Cache.ModuleCacheFolder)
        FS.ensureDirSync(this.Folders.Cache.ModuleCacheFolder)
        FS.ensureDirSync(this.Folders.Cache.ModuleCache.NPMFolder)
        FS.ensureDirSync(this.Folders.Cache.ModuleCache.NPM.ModulesFolder)
        FS.ensureDirSync(this.Folders.Cache.ModuleCache.NPM.ModuleTarsFolder)
        FS.ensureDirSync(this.Folders.Cache.ModuleCache.NPM.UnpackFolder)
        FS.ensureDirSync(this.Folders.Cache.ModuleCache.LITFolder)
    }
}

global.TypeWriter = new TypeWriter()
global.TypeWriter.CreateFolders()

if (!global.TypeWriter.RunAction()) {
    global.TypeWriter.ShowHelp()
}