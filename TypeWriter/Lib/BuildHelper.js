const BuildHelper = {}

const RandomString = require("randomstring")
const FS = require("fs-extra")
const Path = require("path")
const KlawSync = require('klaw-sync')
const Tar = require("tar")

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
    if (!FS.existsSync(BranchFolder)) {TypeWriter.Logger.Error("The selected branch is not valid."); process.exit(1)}
    const BuildId = RandomString.generate(32)
    const BuildFolder = this.GetBuildFolder(BuildId)

    if (!this.CanBuild(BranchFolder)) {TypeWriter.Logger.Error("You need a valid package.info.json and resource folder to build."); process.exit(1)}

    FS.mkdirSync(BuildFolder)
    FS.mkdirSync(`${BuildFolder}/resources/`)

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
                if (Path.extname(FilePath) != FileExt) {TypeWriter.Logger.Error(`Found ${FileName} in ${Path.resolve(FilePath)} but file extension needs to be ${FileExt}.`); process.exit(1)}
                CompiledCode[NewCodePath] = {
                    Type: Type,
                    Code: FS.readFileSync(FilePath, "utf-8")
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

    try {
        const PackageData = FS.readJSONSync(`${BranchFolder}/package.info.json`)
        FS.writeJSONSync(`${BuildFolder}/package.info.json`, PackageData, {spaces: "\t"})
    } catch {
        TypeWriter.Logger.Error("Could not read package.info.json file.")
        process.exit(1)
    }

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
    TypeWriter.Logger.Debug(`Outputting to ${OutputFile}`)
    Tar.create(
        {
            file: OutputFile,
            cwd: BuildFolder,
            sync: true,
        },
        FS.readdirSync(BuildFolder)
    )
}

module.exports = BuildHelper