const SingleTar = require("../Lib/SingleTar")
const FS = require("fs-extra")
const Path = require("path")

function ParseResourcePath(Id, ResourcePath) {
    if (ResourcePath != undefined) {
        return [Id, ResourcePath]
    }
    const Split = Id.split(":")
    return [Split[0], Split[1]]
}

class ResourceManager {
    constructor() {

    }

    ResourceExists(Id, ResourcePath) {
        [Id, ResourcePath] = ParseResourcePath(Id, ResourcePath)
        const Package = TypeWriter.PackageManager.GetPackage(Id)
        return Package.ResourceIndex.includes(ResourcePath)
    }

    ListResources(Id) {
        const Package = TypeWriter.PackageManager.GetPackage(Id)
        return Package.ResourceIndex
    }

    GetRaw(Id, ResourcePath) {
        [Id, ResourcePath] = ParseResourcePath(Id, ResourcePath)
        const Package = TypeWriter.PackageManager.GetPackage(Id)
        return SingleTar(Package.FilePath, `resources${ResourcePath}`)
    }

    GetJson(Id, ResourcePath) {
        return JSON.parse(this.GetRaw(Id, ResourcePath))
    }

    GetFilePath(Id, ResourcePath) {
        [Id, ResourcePath] = ParseResourcePath(Id, ResourcePath)
        const Package = TypeWriter.PackageManager.GetPackage(Id)
        const OutputPath = `${Package.ExecuteFolder}/resources${ResourcePath}`
        FS.ensureDirSync(Path.dirname(OutputPath))
        FS.writeFileSync(OutputPath, this.GetRaw(Id, ResourcePath), "binary")
        return OutputPath
    }

}

module.exports = ResourceManager