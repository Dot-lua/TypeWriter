const BuildHelper = {}

const RandomString = require("randomstring")
const FS = require("fs-extra")
const Path = require("path")
const KlawSync = require('klaw-sync')
const Tar = require("tar")
const DependencyFormatter = TypeWriter.PackageManagers.DependencyFormatter

const BuildCacheFolder = `${TypeWriter.Folder}/Cache/BuildCache/`

BuildHelper.CanBuild = function (Folder) {
    return FS.existsSync(`${Folder}/package.info.json`) && FS.existsSync(`${Folder}/resources`)
}

BuildHelper.GetBuildFolder = function (BuildId) {
    return Path.normalize(`${BuildCacheFolder}/${BuildId}/`)
}

BuildHelper.Build = function (Folder, Branch) {
    const BranchFolder = `${Folder}/${Branch}/`
    if (!FS.existsSync(BranchFolder)) { TypeWriter.Logger.Error("The selected branch is not valid."); return false }
    const BuildId = RandomString.generate(32)
    const BuildFolder = this.GetBuildFolder(BuildId)

    if (!this.CanBuild(BranchFolder)) { TypeWriter.Logger.Error("You need a valid package.info.json and resource folder to build."); return false }

    FS.mkdirSync(BuildFolder)
    FS.mkdirSync(`${BuildFolder}/resources/`)

    FS.ensureDirSync(`${BuildFolder}/js/`)
    FS.ensureDirSync(`${BuildFolder}/lua/`)
    FS.ensureDirSync(`${BuildFolder}/resources/`)

    { // Update Dependencies
        var PackageData
        try {
            PackageData = FS.readJSONSync(`${BranchFolder}/package.info.json`)
        } catch (E) {
            TypeWriter.Logger.Error(`Could not read package.info.json (${E})`)
            return false
        }
        var NeedsWrite = false

        for (const DependencyIndex in PackageData.Dependencies) {
            var Dependency = PackageData.Dependencies[DependencyIndex]

            if (typeof Dependency == "object") {
                const DependencySource = Dependency.Source.toLowerCase()
                var DependencyAuthor
                var DependencyName
                if (Dependency.Package.includes("/")) {
                    DependencyAuthor = Dependency.Package.split("/")[0].substring(1)
                    DependencyName = Dependency.Package.split("/")[1]
                } else {
                    DependencyName = Dependency.Package
                }

                NeedsWrite = true
                PackageData.Dependencies[DependencyIndex] = DependencyFormatter.FormatDependency(
                    {
                        Source: DependencySource,
                        Author: DependencyAuthor,
                        Name: DependencyName,
                        Version: Dependency.Version
                    }
                )

                Dependency = PackageData.Dependencies[DependencyIndex]
            }

            if (!TypeWriter.PackageManagers.PackageExists(Dependency)) {
                TypeWriter.Logger.Error(`Package ${Dependency} does not exist. Please check your package.info.json file.`)
                return false
            }

            if (!TypeWriter.PackageManagers.HasVersion(Dependency)) {
                TypeWriter.Logger.Warning(`Missing version for package ${Dependency}, attempting to find latest version`)
                NeedsWrite = true
                const ParsedDependency = DependencyFormatter.ParseDependency(PackageData.Dependencies[DependencyIndex])
                ParsedDependency.Version = TypeWriter.PackageManagers.LatestPackageVersion(Dependency)
                PackageData.Dependencies[DependencyIndex] = DependencyFormatter.FormatDependency(ParsedDependency)
            }
        }

        if (NeedsWrite) {
            TypeWriter.Logger.Warning(`Updating values in package.info.json`)
            FS.writeJSONSync(`${BranchFolder}/package.info.json`, PackageData, { spaces: "\t" })
        }
        FS.writeJSONSync(`${BuildFolder}/package.info.json`, PackageData, {spaces: "\t"})
    }

    const CompiledCode = {}
    function CodeScan(ScanFolder, Ext) {
        FS.ensureDirSync(ScanFolder)
        ScanFolder = Path.resolve(ScanFolder)
        TypeWriter.Logger.Debug("Scanning " + ScanFolder + " for " + Ext + " files")
        const Files = KlawSync(ScanFolder, { nodir: true })

        for (const FileInformation of Files) {
            const FilePath = FileInformation.path
            if (Path.extname(FilePath) != `.${Ext}`) {
                TypeWriter.Logger.Error(`Found ${FilePath} but file extension needs to be .${Ext}, skipping.`)
                continue
            }
            var CodePath = Path.normalize(FilePath).split(ScanFolder)[1].replaceAll("\\", "/").replaceAll("/", ".")
            if (CodePath.startsWith(".")) { CodePath = CodePath.substring(1) }
            CodePath = CodePath.substring(0, CodePath.length - Ext.length - 1)
            var ParentCodePath = CodePath.split(".")
            delete ParentCodePath[ParentCodePath.length - 1]
            ParentCodePath = ParentCodePath.join(".")
            ParentCodePath = ParentCodePath.substring(0, ParentCodePath.length - 1)

            TypeWriter.Logger.Debug(`Found ${Ext} file ${CodePath} at ${FilePath}`)
            CompiledCode[CodePath] = {
                Type: Ext,
                Code: encodeURIComponent(FS.readFileSync(FilePath, "utf-8"))
            }

            if (Path.basename(FilePath, `.${Ext}`) == "Main") {
                CompiledCode[ParentCodePath] = {
                    Type: "Redirect",
                    Path: CodePath
                }
            } else if (Path.basename(FilePath, `.${Ext}`) == "Index") {
                CompiledCode[ParentCodePath] = {
                    Type: "Redirect",
                    Path: CodePath
                }
            }
        }
    }

    CodeScan(`${BranchFolder}/lua/`, "lua")
    CodeScan(`${BranchFolder}/js/`, "js")

    FS.writeJSONSync(
        `${BuildFolder}/Code.json`,
        CompiledCode,
        {
            spaces: "\t"
        }
    )

    const ResourceIndex = []
    const ResourceFolder = Path.resolve(`${BranchFolder}/resources/`)
    for (const File of KlawSync(ResourceFolder, { nodir: true })) {
        const FilePath = File.path
        const ResourceFilePath = Path.normalize(FilePath.split(ResourceFolder)[1]).replaceAll("\\", "/")
        const DestFilePath = `${BuildFolder}/resources/${ResourceFilePath}`
        TypeWriter.Logger.Debug(`Found resource ${ResourceFilePath} at ${FilePath}`)
        FS.ensureDirSync(Path.dirname(DestFilePath))
        FS.copyFileSync(FilePath, DestFilePath)
        ResourceIndex.push(ResourceFilePath)
    }

    FS.writeJSONSync(
        `${BuildFolder}/ResourceIndex.json`,
        ResourceIndex,
        {
            spaces: "\t"
        }
    )

    return BuildId
}

BuildHelper.CompressBuild = function (BuildId, OutputFolder) {
    if (BuildId == false) {
        TypeWriter.Logger.Error("Looks like the build failed, not compressing")
        return false
    }

    const BuildFolder = this.GetBuildFolder(BuildId)
    const OutputFile = Path.join(OutputFolder, FS.readJSONSync(`${BuildFolder}/package.info.json`).Id) + ".twr"
    TypeWriter.Logger.Debug(`Outputting to ${OutputFile} in ${BuildFolder}`)
    Tar.create(
        {
            file: OutputFile,
            cwd: BuildFolder,
            sync: true,
            noMtime: true,
            portable: true
        },
        FS.readdirSync(BuildFolder)
    )
}

BuildHelper.CleanupBuild = function (BuildId) {
    const BuildFolder = this.GetBuildFolder(BuildId)
    TypeWriter.Logger.Debug(`Cleaning up ${BuildFolder}`)
    FS.rmSync(BuildFolder, { recursive: true, force: true });
}

module.exports = BuildHelper