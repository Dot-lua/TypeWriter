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
    require('app-module-path').addPath(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/`)

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
        PMG[Dependency.Source](Dependency.Package, Dependency.Version)
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

const OriginalRequire = require
RuntimeHelper.Require = function(Request) {
    function IsPackageIncluded(Request) {
        for (const PackageId in TypeWriter.LoadedPackages) {
            const Package = TypeWriter.LoadedPackages[PackageId]
        }

        return false
    }

    if (IsCoreModule(Request)) {
        return OriginalRequire(Request)
    } else if (IsPackageIncluded(Request)) {
        return OriginalRequire
    }
}

module.exports = RuntimeHelper