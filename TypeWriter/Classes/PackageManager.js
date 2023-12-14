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

        for (const SubPackagePath of this.PackageInfo.Preload || []) {
            this.SubPackages.push(await TypeWriter.PackageManager.LoadPackage(TypeWriter.ResourceManager.GetFilePath(SubPackagePath), true))
        }

        if (!this.IsSubPackage) {
            await TypeWriter.DependencyManager.ExecuteQueue()
            await this.LinkDependencies()

            for (const SubPackage of this.SubPackages) {
                await SubPackage.LinkDependencies()
            }
        }
    }

    async LinkDependencies() {
        const DependencyObjects = this.ListDependencyObjects()
        for (const Dependency of DependencyObjects) {
            const DependencyFolder = await TypeWriter.DependencyManager.GetDependencyFolder(Dependency)
            const ModulesDependencyFolder = `${this.NodeModulesFolder}/${Dependency.AtFullName}`
            if (Dependency.Author) { FS.mkdirSync(`${this.NodeModulesFolder}/@${Dependency.Author}`) }
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
        if (!ImportData) {
            const NotFoundError = new Error(`Import '${ImportPath}' not found`)
            NotFoundError.code = "TYPEWRITER_IMPORT_NOT_FOUND"
            throw NotFoundError
        }

        if (ImportData.Type === "Redirect") {
            return await this.Import(ImportData.Path)
        }

        const CodeData = decodeURIComponent(ImportData.Code)
        if (ImportData.Type === "lua") {
            console.log("Importing Lua")
        } else if (ImportData.Type === "js") {
            return await TypeWriter.JavaScript.LoadStringWrapped(CodeData, `${this.PackageInfo.Id}: ${ImportPath}`)
        }
    }

    async LoadEntrypoint(Entrypoint) {
        return await this.Import(this.GetEntrypoints()[Entrypoint])
    }   
}

class PackageManager {
    constructor() {
        this.LoadedPackages = {}
    }

    async LoadPackage(FilePath, IsSubPackage = false) {
        const LoadedPackage = new Package(FilePath, IsSubPackage)
        this.LoadedPackages[LoadedPackage.PackageInfo.Id] = LoadedPackage
        await LoadedPackage.FetchDependencies()
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

    async Import(ImportPath) {
        for (const Package of Object.values(this.LoadedPackages)) {
            try {
                return await Package.Import(ImportPath)
            } catch (error) {
                if (error.code != "TYPEWRITER_IMPORT_NOT_FOUND") {
                    throw error
                }
            }
        }

        const NotFoundError = new Error(`Import '${ImportPath}' not found`)
        NotFoundError.code = "TYPEWRITER_IMPORT_NOT_FOUND"
        throw NotFoundError
    }

}

module.exports = PackageManager