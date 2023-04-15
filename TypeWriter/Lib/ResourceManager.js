const SingleTar = require("../Lib/SingleTar")
const FS = require("fs-extra")
const Path = require("path")

const ResourceManager = {}

function GetPackagePath(Id) {
    return `${TypeWriter.ExecuteFolder}/${Id}/`
}

function ParseResourcePath(Id, ResourcePath) {
    if (ResourcePath != undefined) {
        return [Id, ResourcePath]
    }
    const Split = Id.split(":")
    return [Split[0], Split[1]]
}

ResourceManager.ResourceExists = function(Id, ResourcePath) {
    var ResourceData = ParseResourcePath(Id, ResourcePath); var Id = ResourceData[0]; var ResourcePath = ResourceData[1];
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
    var ResourceData = ParseResourcePath(Id, ResourcePath); var Id = ResourceData[0]; var ResourcePath = ResourceData[1];
    if (!this.ResourceExists(Id, ResourcePath)) {
        return null
    }
    return SingleTar(TypeWriter.LoadedPackages[Id].PackagePath, `resources${ResourcePath}`)
}

ResourceManager.GetJson = function(Id, ResourcePath) {
    var ResourceData = ParseResourcePath(Id, ResourcePath); var Id = ResourceData[0]; var ResourcePath = ResourceData[1];
    if (!this.ResourceExists(Id, ResourcePath)) {
        return null
    }
    return JSON.parse(this.GetRaw(Id, ResourcePath))
}

ResourceManager.GetFilePath = function(Id, ResourcePath) {
    var ResourceData = ParseResourcePath(Id, ResourcePath); var Id = ResourceData[0]; var ResourcePath = ResourceData[1];
    if (!this.ResourceExists(Id, ResourcePath)) {
        return null
    }

    const OutputPath = `${GetPackagePath(Id)}resources${ResourcePath}`
    FS.ensureDirSync(Path.dirname(OutputPath))
    FS.writeFileSync(OutputPath, this.GetRaw(Id, ResourcePath), "binary")
    return OutputPath
}

module.exports = ResourceManager