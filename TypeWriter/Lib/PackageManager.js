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

module.exports = PackageManager