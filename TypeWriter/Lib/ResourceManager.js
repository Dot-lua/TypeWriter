const SingleTar = require("../Lib/SingleTar")
const FS = require("fs-extra")
const Path = require("path")

const ResourceManager = {}

function GetPackagePath(Id) {
    return `${TypeWriter.ExecuteFolder}/${Id}/`
}

function ParseResourcePath(Id, ResourcePath) {
    if (!ResourcePath) {
        const Split = Id.split(":")
        return Split[0], Split[1]
    }
    return Id, ResourcePath
}

ResourceManager.ResourceExists = function(Id, ResourcePath) {
    Id, ResourcePath = ParseResourcePath(Id, ResourcePath)
    if (!TypeWriter.PackageManager.IsPackageLoaded(Id)) {
        return false
    }
    return TypeWriter.LoadedPackages[Id].ResourceIndex.includes(ResourcePath)
}

ResourceManager.ListResources = function(Id) {
    if (!TypeWriter.PackageManager.IsPackageLoaded(Id)) {
        return []
    }
    return TypeWriter.LoadedPackages[Id].ResourceIndex
}

ResourceManager.GetRaw = function(Id, ResourcePath) {
    Id, ResourcePath = ParseResourcePath(Id, ResourcePath)
    if (!ResourceExists(Id, ResourcePath)) {
        return null
    }
    return SingleTar(TypeWriter.LoadedPackages[Id].PackagePath, `resources${ResourcePath}`)
}

ResourceManager.GetJson = function(Id, ResourcePath) {
    Id, ResourcePath = ParseResourcePath(Id, ResourcePath)
    if (!ResourceExists(Id, ResourcePath)) {
        return null
    }
    return JSON.parse(GetRaw(Id, ResourcePath))
}

ResourceManager.GetFilePath = function(Id, ResourcePath) {
    Id, ResourcePath = ParseResourcePath(Id, ResourcePath)
    if (!ResourceExists(Id, ResourcePath)) {
        return null
    }

    const OutputPath = `${GetPackagePath(Id)}resources${ResourcePath}`
    FS.ensureDirSync(Path.dirname(OutputPath))
    FS.writeFileSync(OutputPath, GetRaw(Id, ResourcePath))
    return OutputPath
}

module.exports = ResourceManager