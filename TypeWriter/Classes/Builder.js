const FS = require("fs-extra")
const Path = require("path")
const KlawSync = require('klaw-sync')
const RandomString = require("../Lib/RandomString.js")
const DependencyParser = require("../Lib/DependencyParser.js")
const Tar = require("tar")

async function FixDependencyVersions(Dependencies) {
    let Updated = false
    const VersionFixes = []

    let DependencyIndex = -1
    for (const Dependency of Dependencies) {
        let ParsedDependency = DependencyParser.Parse(Dependency)
        DependencyIndex++

        if (ParsedDependency.Version != undefined) { continue }

        Updated = true
        TypeWriter.Logger.Warning(`No version specified for ${ParsedDependency.FullName}, fixing...`)
        VersionFixes.push(
            [
                DependencyIndex,
                ParsedDependency,
                async function (DependencyIndex, ParsedDependency) {
                    const LatestVersion = await TypeWriter.DependencyManager.GetLatestVersion(ParsedDependency)
                    ParsedDependency.Version = LatestVersion
                    console.log(ParsedDependency)
                    console.log(DependencyIndex)
                    Dependencies[DependencyIndex] = DependencyParser.Format(ParsedDependency)
                }
            ]
            
        )

    }

    await Promise.all(VersionFixes.map(D => D[2](D[0], D[1])))

    console.log(Dependencies)
    return [Updated, Dependencies]
}

async function ScanCode(ScanFolder, Extension) {
    ScanFolder = Path.normalize(ScanFolder)
    const ScannedCode = {}
    const Files = KlawSync(ScanFolder, { nodir: true })
    for (const File of Files) {
        const FilePath = File.path
        const CodePath = FilePath.split(ScanFolder)[1].replaceAll("\\", "/").replaceAll("/", ".").substring(1).split(".").slice(0, -1).join(".")
        console.log(FilePath, CodePath)

        ScannedCode[CodePath] = {
            Type: Extension,
            Code: encodeURIComponent(FS.readFileSync(FilePath, "utf-8"))
        }

        if (CodePath.endsWith(".Main")) {
            ScannedCode[CodePath] = {
                Type: "Redirect",
                Path: CodePath.substring(0, CodePath.length - 5)
            }
        } else if (CodePath.endsWith(".Index")) {
            ScannedCode[CodePath] = {
                Type: "Redirect",
                Path: CodePath.substring(0, CodePath.length - 6)
            }
        }
    }

    return ScannedCode
}

class Builder {
    constructor(Folder, Branch, OutputPath) {
        this.BuildFolder = Folder
        this.BranchFolder = Path.normalize(`${Folder}/${Branch}/`)
        this.OutputPath = OutputPath
        this.BuildId = RandomString(32)
        this.BuildFolder = Path.normalize(`${TypeWriter.Folders.Cache.BuildCacheFolder}/${this.BuildId}/`)
        this.PackageInfoFile = Path.normalize(`${this.BranchFolder}/package.info.json`)

        TypeWriter.Logger.Debug(`Building to ${this.BuildFolder}`)
        
        FS.ensureDirSync(this.BuildFolder)
        FS.cpSync(this.BranchFolder + "/package.info.json", this.BuildFolder + "/package.info.json")

        this.CreateRequiredFolders()
    }

    CreateRequiredFolders() {
        FS.ensureDirSync(this.BranchFolder + "/js")
        FS.ensureDirSync(this.BranchFolder + "/lua")
        FS.ensureDirSync(this.BranchFolder + "/resources")
    }

    async ValidatePackageInfo() {
        const PackageInfo = FS.readJsonSync(this.PackageInfoFile)
        let NeedsUpdate = false

        const [Updated, Dependencies] = await FixDependencyVersions(PackageInfo.Dependencies)
        NeedsUpdate = Updated || NeedsUpdate
        PackageInfo.Dependencies = Dependencies

        if (NeedsUpdate) {
            FS.writeJsonSync(this.PackageInfoFile, PackageInfo, { spaces: 4 })
        }
    }

    async ScanCode() {
        const ScannedCode = Object.assign(
            {},
            await ScanCode(this.BranchFolder + "/lua", "lua"),
            await ScanCode(this.BranchFolder + "/js", "js")
        )

        FS.writeJSONSync(
            `${this.BuildFolder}/Code.json`,
            ScannedCode,
            {
                spaces: "\t"
            }
        )
    }

    async ScanResources() {
        const ResourceFolder = Path.normalize(`${this.BranchFolder}/resources`)
        const DestinationResourceFolder = `${this.BuildFolder}/resources/`
        
        const ResourceIndex = KlawSync(
            this.BranchFolder + "/resources",
            {
                nodir: true
            }
        ).map(
            (File) => {
                const FilePath = File.path
                const ResourceFilePath = Path.normalize(FilePath.split(ResourceFolder)[1]).replaceAll("\\", "/")
                return ResourceFilePath
            }
        )

        FS.copySync(ResourceFolder, DestinationResourceFolder)
        FS.writeJSONSync(
            `${this.BuildFolder}/ResourceIndex.json`,
            ResourceIndex,
            {
                spaces: "\t"
            }
        )
    }
    
    async Compress() {
        const PackageInfo = FS.readJsonSync(this.PackageInfoFile)
        const OutputFile = Path.join(this.OutputPath + `/${PackageInfo.Id}.twr`)
        TypeWriter.Logger.Debug(`Outputting to ${OutputFile} in ${this.BuildFolder}`)
        Tar.create(
            {
                file: OutputFile,
                cwd: this.BuildFolder,
                sync: true,
                noMtime: true,
                portable: true
            },
            FS.readdirSync(this.BuildFolder)
        )

        return OutputFile
    }
    
    async Cleanup() {
        FS.rmSync(this.BuildFolder, { recursive: true, force: true })
    }
}

module.exports = Builder