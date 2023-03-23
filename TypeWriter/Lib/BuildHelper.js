const BuildHelper = {}

const RandomString = require("randomstring")
const FS = require("fs-extra")
const Path = require("path")
const KlawSync = require('klaw-sync')
const Tar = require("tar")
const Pmg = require("./pmg/index")

const BuildCacheFolder = `${TypeWriter.Folder}/Cache/BuildCache/`

BuildHelper.CanBuild = function(Folder) {
    return FS.existsSync(`${Folder}/package.info.json`) && FS.existsSync(`${Folder}/resources`)
}

BuildHelper.GetBuildFolder = function(BuildId) {
    return Path.normalize(`${BuildCacheFolder}/${BuildId}/`)
}

BuildHelper.CleanupBuild = function(BuildId) {
    const BuildFolder = this.GetBuildFolder(BuildId)
    TypeWriter.Logger.Debug(`Cleaning up ${BuildFolder}`)
    FS.rmSync(BuildFolder, { recursive: true, force: true });
}

BuildHelper.Build = function(Folder, Branch) {
    const BranchFolder = `${Folder}/${Branch}/`
    if (!FS.existsSync(BranchFolder)) {TypeWriter.Logger.Error("The selected branch is not valid."); return false}
    const BuildId = RandomString.generate(32)
    const BuildFolder = this.GetBuildFolder(BuildId)

    if (!this.CanBuild(BranchFolder)) {TypeWriter.Logger.Error("You need a valid package.info.json and resource folder to build."); return false}

    FS.mkdirSync(BuildFolder)
    FS.mkdirSync(`${BuildFolder}/resources/`)

    try {
        const PackageData = FS.readJSONSync(`${BranchFolder}/package.info.json`)
        var NeedWrite = false

        for (const Dependency of PackageData.Dependencies) {
            if (!Pmg[Dependency.Source].PackageExists(Dependency.Package)) {
                return false
            }

            if (!Dependency.Version) {
                TypeWriter.Logger.Warning(`Missing version in ${Dependency.Source} package ${Dependency.Package}`)
                TypeWriter.Logger.Warning(`Defaulting to latest version`)
                NeedWrite = true
                Dependency.Version = Pmg[Dependency.Source].GetLatestPackageVersion(Dependency.Package)
            }
        }

        if (NeedWrite) {
            TypeWriter.Logger.Warning(`Updating values in package.info.json`)
            FS.writeJSONSync(`${BranchFolder}/package.info.json`, PackageData, {spaces: "\t"})
        }
        FS.writeJSONSync(`${BuildFolder}/package.info.json`, PackageData, {spaces: "\t"})
    } catch (E) {
        TypeWriter.Logger.Error(`Could not read package.info.json file. (${E})`)
        return false
    }

    const CompiledCode = {}
    function CodeScan(ScanFolder, CodePath, Type) {
        TypeWriter.Logger.Debug("Path is " + CodePath)
        TypeWriter.Logger.Debug("Scanning " + ScanFolder)

        const FileExt = `.${Type}`
        for (const FileName of FS.readdirSync(ScanFolder)) {
            const FileBaseName = Path.basename(FileName, FileExt)
            const FilePath = `${ScanFolder}/${FileName}`
            const IsFileDir = FS.lstatSync(FilePath).isDirectory()
            const NewCodePath = CodePath.length == 0 ? FileBaseName : `${CodePath}.${FileBaseName}`

            TypeWriter.Logger.Debug(`Found ${FilePath} as ${IsFileDir ? "Directory" : "File"}`)

            if (IsFileDir) {
                CodeScan(FilePath, NewCodePath, Type)
            } else {
                if (Path.extname(FilePath) != FileExt) {TypeWriter.Logger.Error(`Found ${FileName} in ${Path.resolve(FilePath)} but file extension needs to be ${FileExt}, skipping.`)}
                CompiledCode[NewCodePath] = {
                    Type: Type,
                    Code: FS.readFileSync(FilePath, "utf-8")
                }
                if (FileBaseName == "Main") {
                    CompiledCode[CodePath] = {
                        Type: "Redirect",
                        Path: NewCodePath
                    }
                }
            }

        }
    }

    CodeScan(`${BranchFolder}/lua/`, "", "lua")
    CodeScan(`${BranchFolder}/js/`, "", "js")

    FS.writeJSONSync(
        `${BuildFolder}/Code.json`,
        CompiledCode,
        {
            spaces: "\t"
        }
    )

    const ResourceIndex = []
    const ResourceFolder = Path.resolve(`${BranchFolder}/resources/`)
    for (const File of KlawSync(ResourceFolder, {nodir: true})) {
        const FilePath = File.path
        const ResourceFilePath = Path.normalize(FilePath.split(ResourceFolder)[1]).replaceAll("\\", "/", )
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

BuildHelper.CompressBuild = function(BuildId, OutputFolder) {
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

module.exports = BuildHelper