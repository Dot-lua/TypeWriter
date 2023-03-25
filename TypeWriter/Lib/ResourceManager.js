const SingleTar = require("../Lib/SingleTar")
const FS = require("fs-extra")
const Path = require("path")

function GetPackagePath(Id) {
    return `${TypeWriter.ExecuteFolder}/${Id}/`
}

function PackageLoaded(Id) {
    return TypeWriter.LoadedPackages[Id] !== undefined
}

function ResourceExists(Id, ResourcePath) {
    if (!PackageLoaded(Id)) {
        console.log("Package not loaded")
        return false
    }
    return TypeWriter.LoadedPackages[Id].ResourceIndex.includes(ResourcePath)
}

function ListResources(Id) {
    if (!PackageLoaded(Id)) {
        return []
    }
    return TypeWriter.LoadedPackages[Id].ResourceIndex
}

function GetRaw(Id, ResourcePath) {
    if (!ResourceExists(Id, ResourcePath)) {
        console.log("Resource not found")
        return null
    }
    return SingleTar(TypeWriter.LoadedPackages[Id].PackagePath, `resources${ResourcePath}`)
}

function GetJson(Id, ResourcePath) {
    if (!ResourceExists(Id, ResourcePath)) {
        return null
    }
    return JSON.parse(GetRaw(Id, ResourcePath))
}

function GetFilePath(Id, ResourcePath) {
    if (!ResourceExists(Id, ResourcePath)) {
        return null
    }

    const OutputPath = `${GetPackagePath(Id)}resources${ResourcePath}`
    FS.ensureDirSync(Path.dirname(OutputPath))
    FS.writeFileSync(OutputPath, GetRaw(Id, ResourcePath))
    return OutputPath
}

module.exports = {
    ResourceExists: ResourceExists,
    ListResources: ListResources,
    GetRaw: GetRaw,
    GetJson: GetJson,
    GetFilePath: GetFilePath
}