const FS = require("fs-extra")
const Path = require("path")
const GetCallerFile = require("get-caller-file")
const IsCoreModule = require("is-builtin-module")

const OriginalRequire = TypeWriter.OriginalRequire
const Exts = ["js", "json", "node"]

function FindModuleEntrypoint(Path) {
    try {
        return require.resolve(Path)
    } catch (error) { }

    const PackageData = FS.readJsonSync(Path + "/package.json")

    if (PackageData.main) {
        return FindModuleEntrypoint(Path + "/" + PackageData.main)
    }

    if (PackageData.exports) {
        if (PackageData.exports["."]) {
            if (PackageData.exports["."].node) {
                return FindModuleEntrypoint(Path + "/" + PackageData.exports["."].node.require)
            }
        }
    }

    if (PackageData.exports) {
        if (PackageData.exports["."]) {
            return FindModuleEntrypoint(Path + "/" + PackageData.exports["."])
        }
    }

}

function GetModuleRoot(Path) {
    const SplitPath = Path.split("/")
    var Index = 0

    for (const PathPart of SplitPath) {
        if (PathPart == "Versions") { break }
        Index++
    }

    return SplitPath.splice(0, Index + 2).join("/") + "/"
}

function GetCallerInformation(Caller) {
    const SplitCaller = Caller.split(": ")
    const CallerData = {}

    if (SplitCaller.length == 2) {
        CallerData.CallerId = SplitCaller[0]
        CallerData.CallerPath = SplitCaller[1]
    } else {
        Caller = Path.normalize(Caller).replaceAll("\\", "/")
        CallerData.ModuleRoot = GetModuleRoot(Caller)
    }

    CallerData.Caller = Caller
    CallerData.IsPackage = CallerData.CallerId != undefined

    if (CallerData.IsPackage) {
        CallerData.PackagePath = TypeWriter.GetPackagePath(CallerData.CallerId)
    } else {
        CallerData.IsModule = true
    }

    return CallerData
}

function GeneratePaths(Request, CallerInfo) {
    const Paths = []

    const Root = CallerInfo.IsPackage ? CallerInfo.PackagePath : CallerInfo.ModuleRoot
    Paths.push(Path.join(Root, "node_modules", Request))

    {
        var PathStart = 1
        if (Request.startsWith("@")) {
            PathStart = 2
        }

        const SplitRequest = Request.split("/")
        const PackageName = SplitRequest.splice(0, PathStart).join("/")
        const PackagePath = Path.join(Root, "node_modules", PackageName)
        Paths.push(Path.join(PackagePath, SplitRequest.join("/")))
    }

    return Paths
}

function Require(Request) {
    const Caller = GetCallerFile(3)
    const CallerInfo = GetCallerInformation(Caller)
    // console.log(Request, Caller, FS.existsSync(Request))

    // console.log(
    //     Request,
    //     Caller,
    //     CallerInfo
    // )

    if (IsCoreModule(Request)) { // Is it a core module
        return OriginalRequire(Request)
    }

    if (Request.startsWith(".")) { // Is it relative
        return OriginalRequire(Path.join(Path.dirname(Caller), Request))
    }

    if (FS.existsSync(Request)) { // Is it a file
        return OriginalRequire(Request)
    }

    const Paths = GeneratePaths(Request, CallerInfo)

    for (const Path of Paths) {
        let EntrypointPath
        try {
            EntrypointPath = FindModuleEntrypoint(Path)
        } catch (error) {
            continue
        }
        if (FS.existsSync(EntrypointPath)) {
            return OriginalRequire(EntrypointPath)
        }
    }

    const Err = new Error("Cannot find module '" + Request + "'")
    Err.code = "MODULE_NOT_FOUND"

    throw Err

}

module.exports = Require