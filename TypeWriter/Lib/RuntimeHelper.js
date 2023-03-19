const RuntimeHelper = {}

const SingleTarRead = require("../Lib/SingleTar")
const FS = require("fs")
const Tar = require("tar")
const Path = require("path")
const LuaHelper = require("./LuaHelper")
const PMG = require("./pmg/")
const RequireString = require("require-from-string")
const IsCoreModule = require("is-core-module")

function GetPackagedJson(FilePath, PackedFile) {
    return JSON.parse(SingleTarRead(FilePath, PackedFile))
}

function GetPackagePath(Package) {
    return `${TypeWriter.ExecuteFolder}/${Package.Id}/`
}

RuntimeHelper.LoadEnvoirment = function(ExecuteFolder) {
    TypeWriter.LoadFile = this.LoadFile
    TypeWriter.ExecuteFolder = ExecuteFolder
    TypeWriter.LoadedPackages = {}
    global.TypeWriterLuaState = LuaHelper.CreateState()
    TypeWriter.Import = this.Import
    global.Import = this.Import
    TypeWriter.LoadEntrypoint = this.LoadEntrypoint
    Module.prototype.require = this.Require

    LuaHelper.LoadFile(TypeWriterLuaState, Path.join(__dirname, "./lua/LuaEnv.lua"))
}

RuntimeHelper.LoadFile = function(FilePath) {
    const PackageInfo = GetPackagedJson(FilePath, "package.info.json")
    const PackagePath = GetPackagePath(PackageInfo)

    if (FS.existsSync(PackagePath)) {
        TypeWriter.Logger.Debug(`${PackageInfo.Id} is already loaded at ${PackagePath}`)
        return false
    }
    FS.mkdirSync(PackagePath)

    for (const Dependency of PackageInfo.Dependencies) {
        PMG[Dependency.Source].LoadPackage(Dependency.Package, Dependency.Version, PackagePath)
    }

    TypeWriter.LoadedPackages[PackageInfo.Id] = {
        Package: PackageInfo,
        Code: GetPackagedJson(FilePath, "Code.json"),
        ResourceIndex: GetPackagedJson(FilePath, "ResourceIndex.json"),
        PackagePath: Path.resolve(FilePath)
    }

    return PackageInfo
}

RuntimeHelper.Import = function(PackagePath) {
    for (const PackageId in TypeWriter.LoadedPackages) {
        const PackageData = TypeWriter.LoadedPackages[PackageId]
        const CodeData = PackageData.Code[PackagePath]
        if (CodeData) {
            if (CodeData.Type == "lua") {
                return LuaHelper.Load(TypeWriterLuaState, CodeData.Code)()
            } else if (CodeData.Type == "js") {
                return RequireString(
                    CodeData.Code,
                    `${PackageId}: ${PackagePath}`
                )
            } else if (CodeData.Type == "Redirect") {
                return this.Import(CodeData.Path)
            }
        }
    }
}

RuntimeHelper.LoadEntrypoint = function(PackageId, EntrypointName) {
    return this.Import(TypeWriter.LoadedPackages[PackageId].Package.Entrypoints[EntrypointName])
}

const OriginalRequire = Module.prototype.require
const NPMCacheFolder = Path.resolve(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/`)
RuntimeHelper.Require = function(Request) {
    const CallerFile = Path.resolve(GetCallerFile(3))

    const Exts = ["js", "json", "node"]
    function FindFileExt(FilePath) {
        for (const Ext of Exts) {
            const CheckPath = `${FilePath}.${Ext}`
            if (FS.existsSync(CheckPath)) { 
                return CheckPath
            }
        }
    }
    
    { // Is it a core module
        if (IsCoreModule(Request)) {
            return OriginalRequire(Request)
        }
    }
    
    { // Is it included
        function IsPackageIncluded(Request) {
            for (const PackageId in TypeWriter.LoadedPackages) {
                const Package = TypeWriter.LoadedPackages[PackageId].Package
                const PackageDependencies = Package.Dependencies
                for (const Dependency of PackageDependencies) {
                    if (Dependency.Source == "NPM" && Dependency.Package == Request) {
                        return Dependency.Version
                    }
                }
            }
    
            return false
        }

        const IsIncluded = IsPackageIncluded(Request)
        if (IsIncluded) {
            return OriginalRequire(PMG.NPM.GetPackageFolder(Request, IsIncluded))
        }
    }

    { // Is it a sub dep
        function GetCallerFolder() {
            const SplitPath = CallerFile.split(NPMCacheFolder)
            SplitPath.shift()
            SplitPath.unshift(NPMCacheFolder)
            const PackageCacheFolder = SplitPath[1].split(Path.sep)
            return `${NPMCacheFolder}/${PackageCacheFolder.filter(function(_, I) {return I < 4}).join("/")}/`
        }

        const CallerFolder = GetCallerFolder()
        const RequestModuleFolder = `${CallerFolder}/node_modules/${Request}`
        if (FS.existsSync(RequestModuleFolder)) {
            return OriginalRequire(RequestModuleFolder)
        }

        const WithExt = FindFileExt(RequestModuleFolder)
        if (WithExt) {
            return OriginalRequire(RequestModuleFolder)
        }
    }
    
    { // Ext stuff
        

        const ResolvedPath = Path.resolve(`${Path.dirname(CallerFile)}/${Request}/`)

        if (FS.existsSync(ResolvedPath)) {
            return OriginalRequire(ResolvedPath)
        }

        const NoExt = FindFileExt(ResolvedPath)
        if (NoExt) {
            return OriginalRequire(NoExt)
        }

        const WithExt = FindFileExt(ResolvedPath + "/index")
        if (WithExt) {
            return OriginalRequire(WithExt)
        }
    }
    console.error("Did not return")
}

module.exports = RuntimeHelper