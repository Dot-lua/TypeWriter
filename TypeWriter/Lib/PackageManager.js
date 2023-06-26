const PackageManager = {}

PackageManager.GetPackageInfo = function (Id) {
    return TypeWriter.LoadedPackages[Id].Package
}

PackageManager.GetPackageEntrypoints = function (Id) {
    return this.GetPackageInfo(Id).Entrypoints
}

PackageManager.ListPackageIds = function () {
    return Object.keys(TypeWriter.LoadedPackages)
}

PackageManager.IsPackageLoaded = function (Id) {
    return this.ListPackageIds().includes(Id)
}

PackageManager.ListDependencyObjects = function(Id) {
    const PackageData = TypeWriter.LoadedPackages[PackageId].Package
    const Objects = []

    for (const DependencyString of PackageData.Dependencies) {
        const DependencyObject = TypeWriter.PackageManagers.TryParse(DependencyString)
        Objects.push(DependencyObject)
    }

    return DependencyObject
}

module.exports = PackageManager