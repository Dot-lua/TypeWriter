const SingleTar = require("../Lib/SingleTar")
const DependencyParser = require("../Lib/DependencyParser")
const FS = require("fs-extra")

function SingleJson(FilePath, Path) {
    return JSON.parse(SingleTar(FilePath, Path))
}

class Package {
    constructor(FilePath, IsSubPackage = false) {
        this.PackageInfo = SingleJson(FilePath, "package.info.json")
        this.Code = SingleJson(FilePath, "Code.json")
        this.ResourceIndex = SingleJson(FilePath, "ResourceIndex.json")

        this.FilePath = FilePath
        this.IsSubPackage = IsSubPackage
        this.SubPackages = []
        this.ExecuteFolder = `${TypeWriter.ExecuteFolder}/${this.PackageInfo.Id}/`
        FS.ensureDirSync(this.ExecuteFolder)
        this.NodeModulesFolder = `${this.ExecuteFolder}/node_modules/`
        FS.ensureDirSync(this.NodeModulesFolder)
    }

    async FetchDependencies() {
        const DependencyObjects = this.ListDependencyObjects()
        for (const Dependency of DependencyObjects) {
            await TypeWriter.DependencyManager.AddDependencyToQueue(Dependency)
        }

        if (!this.IsSubPackage) {
            await TypeWriter.DependencyManager.ExecuteQueue()
            await this.LinkDependencies()
        }
    }

    async LinkDependencies() {
        const DependencyObjects = this.ListDependencyObjects()
        for (const Dependency of DependencyObjects) {
            const DependencyFolder = await TypeWriter.DependencyManager.GetDependencyFolder(Dependency)
            const ModulesDependencyFolder = `${this.NodeModulesFolder}/${Dependency.AtFullName}/`
            FS.symlinkSync(
                DependencyFolder,
                ModulesDependencyFolder,
                TypeWriter.OS == "win32" ? 'junction' : 'dir'
            )
        }
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
        return this.LoadedPackages[Id]
    }

    IsPackageLoaded(Id) {
        return !!this.LoadedPackages[Id]
    }

}

module.exports = PackageManager