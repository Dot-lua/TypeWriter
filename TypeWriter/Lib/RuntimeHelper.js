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

RuntimeHelper.LoadEnvoirment = function (ExecuteFolder) {
    TypeWriter.LoadFile = this.LoadFile
    TypeWriter.ExecuteFolder = ExecuteFolder
    TypeWriter.LoadedPackages = {}
    global.TypeWriterLuaState = LuaHelper.CreateState()
    TypeWriter.Import = this.Import
    global.Import = this.Import
    TypeWriter.LoadEntrypoint = this.LoadEntrypoint
    TypeWriter.PackageManager = require("./PackageManager")
    TypeWriter.ResourceManager = require("./ResourceManager")
    Module.prototype.require = this.Require
    TypeWriter.JsRequire = this.Require

    globalThis.lua = {
        LoadFile: LuaHelper.LoadFile,
        Load: LuaHelper.Load,
        LoadString: LuaHelper.LoadString,
        Global: LuaHelper.Load(TypeWriterLuaState, "return _G")(),
    }
    globalThis.Lua = globalThis.lua
    globalThis.LUA = globalThis.lua

    LuaHelper.LoadFile(TypeWriterLuaState, Path.join(__dirname, "./lua/LuaEnv.lua"))
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

RuntimeHelper.Import = function (PackagePath) {
    for (const PackageId in TypeWriter.LoadedPackages) {
        const PackageData = TypeWriter.LoadedPackages[PackageId]
        const CodeData = PackageData.Code[PackagePath]
        if (CodeData) {
            if (CodeData.Type == "lua") {
                return LuaHelper.Load(
                    TypeWriterLuaState,
                    `
                        local F, E = load(
                            js.global:decodeURIComponent("${CodeData.Code}"),
                            "${PackagePath}"
                        )
                        if not F then
                            error(E)
                        end

                        return coroutine.wrap(
                            F
                        )()
                    `
                )()
            } else if (CodeData.Type == "js") {
                return RequireString(
                    decodeURIComponent(CodeData.Code),
                    `${PackageId}: ${PackagePath}`
                )
            } else if (CodeData.Type == "Redirect") {
                return this.Import(CodeData.Path)
            }
        }
    }
}

RuntimeHelper.LoadEntrypoint = function (PackageId, EntrypointName) {
    return this.Import(TypeWriter.LoadedPackages[PackageId].Package.Entrypoints[EntrypointName])
}

const OriginalRequire = Module.prototype.require
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

    { // Is it a dep of a package
        if ((CallerFile.split(":")[1] || "").startsWith(" ")) {
            const PackageId = CallerFile.split(":")[0]
            if (TypeWriter.LoadedPackages[PackageId]) {
                const PackageData = TypeWriter.LoadedPackages[PackageId].Package
                const Dependency = PackageData.Dependencies.filter(x => x.Package == Request)[0]
                if (Dependency) {
                    //console.log("Dep of a package")
                    try {
                        return OriginalRequire(PMG.NPM.GetPackageFolder(Dependency.Package, Dependency.Version))
                    } catch (error) { }

                    const ModuleData = FS.readJSONSync(Path.join(PMG.NPM.GetPackageFolder(Dependency.Package, Dependency.Version), "package.json"))
                    if (ModuleData.main) {
                        return OriginalRequire(Path.join(PMG.NPM.GetPackageFolder(Dependency.Package, Dependency.Version), ModuleData.main))
                    } else if (ModuleData.exports["."].require) {
                        return OriginalRequire(Path.join(PMG.NPM.GetPackageFolder(Dependency.Package, Dependency.Version), ModuleData.exports["."].require))
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
            const PackageData = TypeWriter.LoadedPackages[PackageId].Package
            const Dependency = PackageData.Dependencies.filter(x => x.Package == RequestName)[0]
            if (Dependency) {
                //console.log("Dep of a package")
                return OriginalRequire(PMG.NPM.GetPackageFolder(Dependency.Package, Dependency.Version) + RequestRest)
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