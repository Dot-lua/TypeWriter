const RuntimeHelper = {}

const SingleTarRead = require("../Lib/SingleTar")
const FS = require("fs-extra")
const Path = require("path")
const IsCoreModule = require("is-builtin-module")
const GetCallerFile = require("get-caller-file")

function GetPackagedJson(FilePath, PackedFile) {
    return JSON.parse(SingleTarRead(FilePath, PackedFile))
}

function GetPackagePath(Package) {
    return `${TypeWriter.ExecuteFolder}/${Package.Id}/`
}

RuntimeHelper.LoadFile = function (FilePath) {
    const PackageInfo = GetPackagedJson(FilePath, "package.info.json")
    const PackagePath = GetPackagePath(PackageInfo)

    if (FS.existsSync(PackagePath)) {
        TypeWriter.Logger.Debug(`${PackageInfo.Id} is already loaded at ${PackagePath}`)
        return false
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

const OriginalRequire = TypeWriter.OriginalRequire
const NPMCacheFolder = Path.resolve(`${TypeWriter.Folder}/Cache/ModuleCache/NPM/Modules/`)
const Exts = ["js", "json", "node"]
function FindFileExt(FilePath) {
    for (const Ext of Exts) {
        const CheckPath = `${FilePath}.${Ext}`
        if (FS.existsSync(CheckPath)) {
            return CheckPath
        }
    }
}
RuntimeHelper.Require = function (Request) {
    const CallerFile = GetCallerFile(3)
    //console.log(Request)
    //console.log(CallerFile)

    var RequestName
    var RequestRest = ""
    if (Request.startsWith("@")) {
        RequestName = Request
    } else if (Request.split("/").length >= 2) {
        RequestName = Request.split("/")[0]
        RequestRest = Request.split("/").splice(1).join("/")
    } else {
        RequestName = Request
    }
    //console.log(RequestName)

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

    { // Is It a direct file path
        const FoundExt = FindFileExt(Request)
        if (FS.existsSync(FoundExt)) {
            //console.log("Direct Path")
            return OriginalRequire(FoundExt)
        }
    }

    { // Is it a dep of a package
        if ((CallerFile.split(":")[1] || "").startsWith(" ")) {
            const PackageId = CallerFile.split(":")[0]
            if (TypeWriter.PackageManager.IsPackageLoaded(PackageId)) {
                const Dependency = TypeWriter.PackageManager.ListDependencyObjects(PackageId).find(Dependency => Dependency.AtFullName == Request)
                if (Dependency) {
                    //console.log("Dep of a package")
                    const PackageFolder = TypeWriter.PackageManagers.PackageFolder(Dependency)
                    try {
                        return OriginalRequire(PackageFolder)
                    } catch (error) { }

                    const ModuleData = FS.readJSONSync(Path.join(PackageFolder, "package.json"))
                    if (ModuleData.main) {
                        return OriginalRequire(Path.join(PackageFolder, ModuleData.main))
                    } else if (ModuleData.exports["."].require) {
                        return OriginalRequire(Path.join(PackageFolder, ModuleData.exports["."].require))
                    }

                }
            }

        }
    }

    { // Is it a dep of a module
        if (CallerFile.split(NPMCacheFolder)[1]) {
            if (FS.existsSync(Path.join(NPMCacheFolder, RequestName))) {
                //console.log("Dep of a module")
                const PathParts = CallerFile.split(NPMCacheFolder)[1].replaceAll("\\", "/").split("/")
                const CallerRoot = Path.join(NPMCacheFolder, PathParts.filter(function (_, I) { return I < (PathParts[1].startsWith("@") ? 5 : 4) }).join("/"))

                const FoundFolder = Path.join(CallerRoot, `node_modules/${Request}`)
                if (FS.existsSync(FoundFolder)) {
                    //console.log(1)
                    return OriginalRequire(FoundFolder)
                }

                const FoundExtFolder = FindFileExt(FoundFolder)
                if (FoundExtFolder) {
                    //console.log(1.5)
                    return OriginalRequire(FoundExtFolder)
                }

                const SplitFoundFolder = FoundFolder.replaceAll("\\", "/").split("/")
                SplitFoundFolder.pop()
                if (FS.existsSync(SplitFoundFolder.join("/")) && SplitFoundFolder[SplitFoundFolder.length - 1] != "node_modules") {
                    //console.log(2)
                    return OriginalRequire(FoundFolder)
                }

            }
        }
    }

    { // Fallback to any dep of a package
        for (const PackageId in TypeWriter.LoadedPackages) {
            const Dependency = TypeWriter.PackageManager.ListDependencyObjects(PackageId).find(Dependency => Dependency.AtFullName == Request)
            if (Dependency) {
                //console.log("Dep of a package")
                return OriginalRequire(TypeWriter.PackageManagers.PackageFolder(Dependency) + RequestRest)
            }
        }
    }

    { //Is it a literal path
        if (FS.existsSync(Request)) {
            //console.log("Literal")
            return OriginalRequire(Request)
        }
    }

    throw new Error(`Could not find module ${Request}`)

}

module.exports = RuntimeHelper