const FetchJson = require("../../../Lib/FetchJson.js")
const Fetch = require("node-fetch")
const FS = require("fs-extra")
const Path = require("path")

async function GetDependencyFiles(DependencyName, Version) {
    const [_1, DependencyData] = await FetchJson(`https://cdn.jsdelivr.net/npm/${DependencyName}@${Version}/package.json`)
    const FullDependencyName = `${DependencyData.name}@${DependencyData.version}`
    const DependencyFolder = `${TypeWriter.Folders.Cache.ModuleCache.NPM.ModulesFolder}/${FullDependencyName}/`
    const FullyDownloadedFile = `${DependencyFolder}/TypeWriter.FullyDownloaded`

    const SubDependencyPromises = []
    for (const SubDependencyName in DependencyData.dependencies) {
        const SubDependencyVersion = DependencyData.dependencies[SubDependencyName]
        SubDependencyPromises.push(GetDependencyFiles(SubDependencyName, SubDependencyVersion))
    }

    let Files = (await Promise.all(SubDependencyPromises)).flat()

    if (FS.existsSync(FullyDownloadedFile)) {
        return Files
    }

    const [_2, Metadata] = await FetchJson(`https://data.jsdelivr.com/v1/package/npm/${FullDependencyName}/?structure=flat`)

    Files = [
        ...Files,
        ...Metadata.files.map(
            File => {
                return {
                    Type: "Download",
                    Name: File.name,
                    For: FullDependencyName,
                    Path: `${DependencyFolder}/${File.name}`,
                    Url: `http://cdn.jsdelivr.net/npm/${FullDependencyName}${File.name}`
                }
            }
        ),
        // {
        //     Type: "File",
        //     Name: "TypeWriter.FullyDownloaded",
        //     For: FullDependencyName,
        //     Path: FullyDownloadedFile,
        //     Content: ""
        // }
    ]

    return Files
}

class NPM {
    constructor() {
        this.DependencyQueue = []
    }

    async GetLatestVersion(Dependency) {
        const [Response, Data] = await FetchJson(`https://cdn.jsdelivr.net/npm/${Dependency.AtFullName}/package.json`)
        return Data.version
    }

    async GetDependencyFolder(Dependency, Version) {
        if (Version) {
            return `${TypeWriter.Folders.Cache.ModuleCache.NPM.ModulesFolder}/${Dependency}@${Version}/`
        } else {
            return `${TypeWriter.Folders.Cache.ModuleCache.NPM.ModulesFolder}/${Dependency.AtFullName}@${Dependency.Version}/`
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
            TypeWriter.Logger.Information(`Dependency ${Dependency.AtFullName} already downloaded, skipping...`)
            return
        }
        this.DependencyQueue.push(Dependency)
    }

    async ExecuteQueue() {
        console.log(this.DependencyQueue, "q")
        const FilePromises = []
        for (const Dependency of this.DependencyQueue) {
            FilePromises.push(GetDependencyFiles(Dependency.AtFullName, Dependency.Version))
        }
        const Files = (await Promise.all(FilePromises)).flat()
        console.log(Files)

        const DownloadPromises = []
        for (const File of Files) {
            if (File.Type == "Download") {
                DownloadPromises.push(
                    async function () {
                        const Response = await Fetch(File.Url)
                        const Content = await Response.text()
                        FS.mkdirpSync(Path.dirname(File.Path))
                        FS.writeFileSync(File.Path, Content)
                        TypeWriter.Logger.Information(`Downloaded ${File.Name} for ${File.For}`)
                    }
                )
            } else if (File.Type == "File") {
                FS.mkdirpSync(Path.dirname(File.Path))
                FS.writeFileSync(File.Path, File.Content)
            }
        }

        await Promise.all(DownloadPromises.map(P => P()))

        const Dependencies = {}
        Files.forEach(File => Dependencies[File.For] = true)
        console.log(Dependencies)
    }

}

module.exports = NPM