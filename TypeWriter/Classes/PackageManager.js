const SingleTar = require("../Lib/SingleTar")
const DependencyParser = require("../Lib/DependencyParser")

function SingleJson(FilePath, Path) {
    return JSON.parse(SingleTar(FilePath, Path))
}

class Package {
    constructor(FilePath, IsSubPackage = false) {
        this.FilePath = FilePath
        this.IsSubPackage = IsSubPackage
        this.PackageInfo = SingleJson(FilePath, "package.info.json")
        this.Code = SingleJson(FilePath, "Code.json")
        this.ResourceIndex = SingleJson(FilePath, "ResourceIndex.json")
    }

    async FetchDependencies() {
        const DependencyObjects = this.ListDependencyObjects()
        for (const Dependency of DependencyObjects) {
            await TypeWriter.DependencyManager.AddDependencyToQueue(Dependency)
        }
        if (this.IsSubPackage) { return }
        await TypeWriter.DependencyManager.ExecuteQueue()
    }

    GetPackageInfo() {
        return this.PackageInfo
    }

    GetEntrypoints() {
        return this.PackageInfo.Entrypoints
    }

    ListDependencyObjects() {
        return this.PackageInfo.Dependencies.map(Dependency => DependencyParser.Parse(Dependency))
    }

    async Import(ImportPath) {
        const ImportData = this.Code[ImportPath]
        if (!ImportData) { throw new Error(`Import '${ImportPath}' not found`) }

        if (ImportData.Type === "Redirect") {
            return await this.Import(ImportData.Path)
        }

        const CodeData = decodeURIComponent(ImportData.Code)
        if (ImportData.Type === "lua") {
            console.log("Importing Lua")
        } else if (ImportData.Type === "js") {
            const WrappedCodeData = `module.exports = (async function WrappedImport() { \n${CodeData}\nreturn module.exports })`
            const WrappedImport = await TypeWriter.JavaScript.LoadString(WrappedCodeData, `${this.PackageInfo.Id}: ${ImportPath}`)
            return await WrappedImport()
        }
    }

    async LoadEntrypoint(Entrypoint) {
        this.Import(this.GetEntrypoints()[Entrypoint])
    }   
}

class PackageManager {
    constructor() {
        this.LoadedPackages = {}
    }

    async LoadPackage(FilePath) {
        const LoadedPackage = new Package(FilePath)
        await LoadedPackage.FetchDependencies()
        this.LoadedPackages[LoadedPackage.PackageInfo.Id] = LoadedPackage
        return LoadedPackage
    }

    ListPackageIds() {
        return Object.keys(this.LoadedPackages)
    }

    GetPackage(Id) {
        return self.LoadedPackages[Id]
    }

    IsPackageLoaded(Id) {
        return !!self.LoadedPackages[Id]
    }

}

module.exports = PackageManager