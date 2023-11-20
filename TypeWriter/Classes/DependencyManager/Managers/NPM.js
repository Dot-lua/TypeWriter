const FetchJson = require("../../../Lib/FetchJson.js")
const Fetch = require("node-fetch")
const FS = require("fs-extra")
const Path = require("path")
const Pall = require("p-all")
const FetchFile = require("../../../Lib/FetchFile.js")
const Tar = require("tar")
const FSHelpers = require("../../../Lib/FSHelpers")

async function SplitNameAndVersion(NameAndVersion) {
    const SplitDependency = NameAndVersion.split("@")
    let DependencyName = SplitDependency[0]
    let DependencyVerison = SplitDependency[1]
    if (SplitDependency.length == 3) {
        DependencyName = SplitDependency[0] + "@" + SplitDependency[1]
        DependencyVerison = SplitDependency[2]
    }
    return [DependencyName, DependencyVerison]
}

async function GetDependencyDownloadLink(Name, Version) {
    let AuthorLessName = Name
    if (Name.startsWith("@")) {
        AuthorLessName = Name.split("/")[1]
    }
    return `https://registry.npmjs.org/${Name}/-/${AuthorLessName}-${Version}.tgz`
}

async function BuildDependencyTree(Dependencies) {
    const Promises = []
    for (const DependencyName in Dependencies) {
        const DependencyVersion = Dependencies[DependencyName]
        Promises.push(
            async function() {
                const [_, DependencyData] = await FetchJson(`https://cdn.jsdelivr.net/npm/${DependencyName}@${DependencyVersion}/package.json`)
                return [DependencyData.name, DependencyData.version, await BuildDependencyTree(DependencyData.dependencies)]
            }
        )
    }
    const DependencyData = await Promise.all(Promises.map(Promise => Promise()))

    const ReturnData = {}
    for (const Dependency of DependencyData) {
        ReturnData[Dependency[0] + "@" + Dependency[1]] = Dependency[2]
    }
    return ReturnData
}

async function FlatDependencyTree(DependencyTree, Dependencies = []) {
    for (const Dependency in DependencyTree) {
        const ChildDependencies = DependencyTree[Dependency]
        if (Dependencies.includes(Dependency)) { continue }
        Dependencies.push(Dependency)
        await FlatDependencyTree(ChildDependencies, Dependencies)
    }
    return Dependencies
}

async function LinkDependencies(DependencyTree) {
    for (const Dependency in DependencyTree) {
        const SubDependencies = DependencyTree[Dependency]
        const DependencyFolder = `${TypeWriter.Folders.Cache.ModuleCache.NPMFolder}/${Dependency}/`
        const NodeModulesFolder = `${DependencyFolder}/node_modules/`
        FS.ensureDirSync(NodeModulesFolder)
        for (const SubDependency in SubDependencies) {
            const [SubDependencyName] = await SplitNameAndVersion(SubDependency)
            const SubDependencyFolder = `${TypeWriter.Folders.Cache.ModuleCache.NPMFolder}/${SubDependency}/`
            if (SubDependency.startsWith("@")) {
                const SplitDependency = SubDependency.split("/")
                const SubDependencyFolder = `${NodeModulesFolder}/${SplitDependency[0]}/`
                FS.ensureDirSync(SubDependencyFolder)
            }
            const SymlinkLocation = `${NodeModulesFolder}/${SubDependencyName}`
            if (FS.existsSync(SymlinkLocation)) { continue }
            FS.symlinkSync(
                SubDependencyFolder,
                `${NodeModulesFolder}/${SubDependencyName}`,
                TypeWriter.OS == "win32" ? 'junction' : 'dir'
            )
        }
        await LinkDependencies(SubDependencies)
    }
}

async function GetDependency(Name, Version) {
    const FullDependencyName = `${Name}@${Version}`

    const NPMFolder = `${TypeWriter.Folders.Cache.ModuleCache.NPMFolder}/`
    const DependencyFolder = `${NPMFolder}/${FullDependencyName}/`
    const UnpackFolder = `${NPMFolder}/${FullDependencyName}_Unpack/`
    const TarFile = `${NPMFolder}/${FullDependencyName}.tar.gz`

    const DownloadLink = await GetDependencyDownloadLink(Name, Version)
    await FetchFile(DownloadLink, TarFile)

    if (FS.existsSync(UnpackFolder)) { return }
    FS.ensureDirSync(UnpackFolder)
    await Tar.extract(
        {
            file: TarFile,
            cwd: UnpackFolder,
            preserveOwner: false
        }
    )

    const MoveFolder = FSHelpers.FindDown(UnpackFolder, "package.json")
    while (true) {
        try {
            await FS.moveSync(MoveFolder, DependencyFolder)
            break
        } catch (error) {
            TypeWriter.Logger.Warning(`Failed to move ${error}`)
        }
    }
}

class NPM {
    constructor() {
        this.DependencyQueue = []
    }

    async GetLatestVersion(Dependency) {
        const [_, Data] = await FetchJson(`https://cdn.jsdelivr.net/npm/${Dependency.AtFullName}/package.json`)
        return Data.version
    }

    async GetDependencyFolder(Dependency, Version) {
        if (Version) {
            return `${TypeWriter.Folders.Cache.ModuleCache.NPMFolder}/${Dependency}@${Version}/`
        } else {
            return `${TypeWriter.Folders.Cache.ModuleCache.NPMFolder}/${Dependency.AtFullName}@${Dependency.Version}/`
        }
    }

    async Exists(Dependency, Version) {
        if (Version) {
            if (Version == true) {
                Version = Dependency.Version
                Dependency = Dependency.AtFullName
            }
            const DependencyFolder = await this.GetDependencyFolder(Dependency, Version)
            const FolderExists = FS.existsSync(DependencyFolder)
            return FolderExists
        } else {
            const DependencyFolder = await this.GetDependencyFolder(Dependency)
            const FolderExists = FS.existsSync(DependencyFolder)
            if (!FolderExists) {
                const [Response] = await FetchJson(`https://cdn.jsdelivr.net/npm/${Dependency.AtFullName}/package.json`)
                const Exists = Response.status == 200
                return Exists
            }
            return true
        }
    }

    async AddDependencyToQueue(Dependency) {
        if (await this.Exists(Dependency, true)) {
            TypeWriter.Logger.Debug(`Dependency ${Dependency.AtFullName} already downloaded, skipping...`)
            return
        }
        this.DependencyQueue.push(Dependency)
    }

    async ExecuteQueue() {
        TypeWriter.Logger.Information(`Downloading ${this.DependencyQueue.length} dependencies...`)
        const MappedDependencies = {}
        for (const Dependency of this.DependencyQueue) {
            MappedDependencies[Dependency.AtFullName] = Dependency.Version
        }
        const DependencyTree = await BuildDependencyTree(MappedDependencies)
        const FlattendDependencyTree = await FlatDependencyTree(DependencyTree)

        const DependencyPromises = []
        for (const Dependency of FlattendDependencyTree) {
            const [DependencyName, DependencyVerison] = await SplitNameAndVersion(Dependency)

            DependencyPromises.push(GetDependency(DependencyName, DependencyVerison))
        }
        await Promise.all(DependencyPromises)

        await LinkDependencies(DependencyTree)

    }

}

module.exports = NPM