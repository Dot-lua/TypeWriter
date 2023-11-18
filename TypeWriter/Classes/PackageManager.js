const SingleTar = require("../Lib/SingleTar")

function SingleJson(FilePath, Path) {
    return JSON.parse(SingleTar(FilePath, Path))
}

class Package {
    constructor(FilePath) {
        this.FilePath = FilePath
        this.PackageInfo = SingleJson(FilePath, "package.info.json")
        this.Code = SingleJson(FilePath, "Code.json")
        this.ResourceIndex = SingleJson(FilePath, "ResourceIndex.json")
    }

    async FetchDependencies() {
        
    }
}

class PackageManager {
    constructor() {
        this.LoadedPackages = {}
    }

    async LoadPackage(FilePath) {
        const LoadedPackage = new Package(FilePath)
        this.LoadedPackages[LoadedPackage.PackageInfo.Id] = LoadedPackage
        return LoadedPackage
    }

    GetPackageInfo(Id) {
        return TypeWriter.LoadedPackages[Id].Package
    }

    GetPackageEntrypoints(Id) {
        return this.GetPackageInfo(Id).Entrypoints
    }

    ListPackageIds() {
        return Object.keys(TypeWriter.LoadedPackages)
    }

    IsPackageLoaded(Id) {
        return this.ListPackageIds().includes(Id)
    }

    ListDependencyObjects(Id) {
        const PackageData = TypeWriter.LoadedPackages[Id].Package
        const Objects = []

        for (const DependencyString of PackageData.Dependencies) {
            const DependencyObject = TypeWriter.PackageManagers.TryParse(DependencyString)
            Objects.push(DependencyObject)
        }

        return Objects
    }
}

module.exports = PackageManager