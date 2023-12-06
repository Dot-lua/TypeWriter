const FS = require("fs-extra")
const FSHelpers = require("./FSHelpers")
const Path = require("path")
const GetCallerFile = require("get-caller-file")
const IsCoreModule = require("is-builtin-module")

const OriginalRequire = TypeWriter.OriginalRequire
const Exts = ["js", "json", "node"]

function GetModuleRoot(ModulePath) {
    return FSHelpers.FindUp(ModulePath, "package.json")
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
        CallerData.PackagePath = TypeWriter.PackageManager.GetPackage(CallerData.CallerId).ExecuteFolder
    } else {
        CallerData.IsModule = true
    }

    return CallerData
}

function Require(Request) {
    const Caller = GetCallerFile(3)
    const CallerInfo = GetCallerInformation(Caller)

    // console.log(
        // Request,
        // Caller,
        // CallerInfo
    // )

    if (IsCoreModule(Request)) { // Is it a core module
        return OriginalRequire(Request)
    }

    if (Request.startsWith(".")) { // Is it relative
        return OriginalRequire(Path.join(Path.dirname(Caller), Request))
    }

    if (CallerInfo.IsPackage) {
        const Package = TypeWriter.PackageManager.GetPackage(CallerInfo.CallerId)
        return OriginalRequire(Path.join(Package.NodeModulesFolder, Request))
    }

    if (CallerInfo.IsModule) {
        return OriginalRequire(require.resolve(Request, { paths: [CallerInfo.ModuleRoot] }))
    }

    const Err = new Error("Module not found: " + Request)
    Err.code = "MODULE_NOT_FOUND"
    throw Err
}

module.exports = Require