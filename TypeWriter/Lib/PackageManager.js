class PackageManager {
    constructor() {

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