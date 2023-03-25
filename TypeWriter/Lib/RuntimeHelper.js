const RuntimeHelper = {}

const SingleTarRead = require("../Lib/SingleTar")
const FS = require("fs-extra")
const Tar = require("tar")
const Path = require("path")
const LuaHelper = require("./LuaHelper")
const PMG = require("./pmg/")
const RequireString = require("require-from-string")
const IsCoreModule = require("is-builtin-module")
const GetCallerFile = require("get-caller-file")
const { Module } = require("module")

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
    TypeWriter.ResourceManager = require("./ResourceManager")
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
TypeWriter.OriginalRequire = OriginalRequire
const NPMCacheFolder = Path.resolve(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/Modules/`)
RuntimeHelper.Require = function(Request) {
    const CallerFile = GetCallerFile(3)
    //console.log(Request)
    //console.log(CallerFile)

    { // Is it a core module
        if (IsCoreModule(Request)) {
            //console.log("Core Module")
            return OriginalRequire(Request)
        }
    }

    { // Is it relative
        if (Request.startsWith(".")) {
            //console.log("Relative")
            return OriginalRequire(Path.join(Path.dirname(CallerFile), Request))
        }
    }

    { // Is it a dep of a package
        if ((CallerFile.split(":")[1] || "").startsWith(" ")) {
            const PackageId = CallerFile.split(":")[0]
            if (TypeWriter.LoadedPackages[PackageId]) {
                const PackageData = TypeWriter.LoadedPackages[PackageId].Package
                const Dependency = PackageData.Dependencies.filter(x => x.Package == Request)[0]
                if (Dependency) {
                    //console.log("Dep of a package")
                    return OriginalRequire(PMG.NPM.GetPackageFolder(Dependency.Package, Dependency.Version))
                }
            }

        }
    }

    { // Is it a dep of a module
        if (CallerFile.split(NPMCacheFolder)[1]) {
            var RequestName
            if (Request.startsWith("@")) {
                RequestName = Request
            } else if (Request.split("/").length == 2) {
                RequestName = Request.split("/")[0]
            } else {
                RequestName = Request
            }
            if (FS.existsSync(Path.join(NPMCacheFolder, RequestName))) {
                //console.log("Dep of a module")
                const CallerRoot = Path.join(NPMCacheFolder, CallerFile.split(NPMCacheFolder)[1].replaceAll("\\", "/").split("/").filter(function(_, I) {return I < 4}).join("/"))
                return OriginalRequire(Path.join(CallerRoot, `node_modules/${Request}`))
            }
        }
    }

    
    
}

module.exports = RuntimeHelper