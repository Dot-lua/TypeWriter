const RuntimeHelper = {}

const SingleTarRead = require("../Lib/SingleTar")
const FS = require("fs-extra")
const Path = require("path")

function GetPackagedJson(FilePath, PackedFile) {
    return JSON.parse(SingleTarRead(FilePath, PackedFile))
}

function GetPackagePath(Package) {
    var Id = Package
    if (typeof Package == "object") { Id = Package.Id }
    return Path.normalize(`${TypeWriter.ExecuteFolder}/${Id}/`)
}

RuntimeHelper.GetPackagePath = GetPackagePath

RuntimeHelper.LoadFile = function (FilePath) {
    const PackageInfo = GetPackagedJson(FilePath, "package.info.json")
    const PackagePath = GetPackagePath(PackageInfo)

    if (FS.existsSync(PackagePath)) {
        TypeWriter.Logger.Debug(`${PackageInfo.Id} is already loaded at ${PackagePath}`)
        return PackageInfo
    }
    FS.mkdirSync(PackagePath)

    for (const Dependency of PackageInfo.Dependencies) {
        TypeWriter.PackageManagers.LoadPackage(Dependency, PackagePath)
    }

    TypeWriter.LoadedPackages[PackageInfo.Id] = {
        Package: PackageInfo,
        Code: GetPackagedJson(FilePath, "Code.json"),
        ResourceIndex: GetPackagedJson(FilePath, "ResourceIndex.json"),
        PackagePath: Path.resolve(FilePath)
    }

    return PackageInfo
}

RuntimeHelper.Import = function (PackagePath) {
    for (const PackageId in TypeWriter.LoadedPackages) {
        const PackageData = TypeWriter.LoadedPackages[PackageId]
        const CodeData = PackageData.Code[PackagePath]
        if (CodeData) {
            if (CodeData.Type == "lua") {
                return TypeWriter.Lua.LoadString(
                    decodeURIComponent(CodeData.Code),
                    `${PackageId}: ${PackagePath}`
                )
            } else if (CodeData.Type == "js") {
                return TypeWriter.JavaScript.LoadString(
                    decodeURIComponent(CodeData.Code),
                    `${PackageId}: ${PackagePath}`
                )
            } else if (CodeData.Type == "Redirect") {
                return this.Import(CodeData.Path)
            }
        }
    }
}

RuntimeHelper.ImportAsync = async function (PackagePath) {
    for (const PackageId in TypeWriter.LoadedPackages) {
        const PackageData = TypeWriter.LoadedPackages[PackageId]
        const CodeData = PackageData.Code[PackagePath]
        if (CodeData) {
            if (CodeData.Type == "lua") {
                return await TypeWriter.Lua.LoadStringAsync(
                    decodeURIComponent(CodeData.Code),
                    `${PackageId}: ${PackagePath}`
                )
            } else if (CodeData.Type == "js") {
                return await TypeWriter.JavaScript.LoadStringAsync(
                    decodeURIComponent(CodeData.Code),
                    `${PackageId}: ${PackagePath}`
                )
            } else if (CodeData.Type == "Redirect") {
                return await this.ImportAsync(CodeData.Path)
            }
        }
    }
}

RuntimeHelper.LoadEntrypoint = function (PackageId, EntrypointName) {
    return this.Import(TypeWriter.LoadedPackages[PackageId].Package.Entrypoints[EntrypointName])
}

RuntimeHelper.LoadEntrypointAsync = async function (PackageId, EntrypointName) {
    return await this.ImportAsync(TypeWriter.PackageManager.GetPackageEntrypoints(PackageId)[EntrypointName])
}

RuntimeHelper.Require = require("./Require")

module.exports = RuntimeHelper