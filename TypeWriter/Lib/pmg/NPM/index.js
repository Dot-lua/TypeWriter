const FS = require("fs-extra")
const Fetch = require("sync-fetch")
const Path = require("path")
const Tar = require("tar")
const KlawSync = require("klaw-sync")
const JsonRequest = require("../../JsonRequest")

const CacheFolder =         `${TypeWriter.Folder}/Cache/ModuleCache/NPM/`
const ModulesFolder =       `${CacheFolder}/Modules/`
const ModuleTarsFolder =    `${CacheFolder}/ModuleTars/`
const UnpackFolder =        `${CacheFolder}/Unpack/`

function GetModuleFolder(PackageName) {
    const SplitName = PackageName.split("/")
    if (SplitName.length == 2) {
        FS.ensureDirSync(`${ModulesFolder}/${SplitName[0]}`)
        return `${ModulesFolder}/${SplitName[0]}/${SplitName[1]}`
    }
    return `${ModulesFolder}/${PackageName}`
}

function GetPackageInfo(PackageName, PackageVersion) {
    TypeWriter.Logger.Debug(`Getting package info for ${PackageName}@${PackageVersion}``)
    return JsonRequest(
        `https://unpkg.com/${PackageName}@${PackageVersion}/package.json`
    ).Data
}

function FindClosest(FolderPath, FileName) {
    const FileList = KlawSync(
        FolderPath,
        {
            nodir: true,
            preserveOwner: false
        }
    )
    const FoundFolder = Path.dirname(FileList.filter(
        function(File) {
            return Path.basename(File.path) == FileName
        }
    ).reduce(
        function(a, b) {
            return a.path.length <= b.path.length ? a : b;
        }
    ).path)
    return FoundFolder
}

function CreatePackageFolders(PackageName) {
    const ModuleFolder = GetModuleFolder(PackageName)
    if (FS.existsSync(ModuleFolder)) {return}
    FS.mkdirSync(ModuleFolder)
    FS.mkdirSync(`${ModuleFolder}/Versions`)
    FS.writeJSONSync(
        `${ModuleFolder}/PackageInfo.json`,
        {
            Name: PackageName
        }
    )
}

function DownloadPackageArchive(PackageName, PackageVersion) {
    const OutputFile = `${ModuleTarsFolder}/${PackageName}/${PackageVersion}.tgz`
    if (FS.existsSync(OutputFile)) {return OutputFile}
    TypeWriter.Logger.Debug(`Downloading ${PackageName}@${PackageVersion}`)
    FS.mkdirpSync(Path.dirname(OutputFile))

    const FetchData = Fetch(`https://registry.npmjs.org/${PackageName}/-/${PackageName.split("/").filter(x => !x.startsWith("@"))[0]}-${PackageVersion}.tgz`)
    FS.writeFileSync(OutputFile, FetchData.buffer())

    return OutputFile
}

function UnpackPackageArchive(PackageName, PackageVersion) {
    const OutputFolder = `${ModulesFolder}/${PackageName}/Versions/${PackageVersion}`
    if (FS.existsSync(OutputFolder)) {return OutputFolder}
    TypeWriter.Logger.Debug(`Unpacking ${PackageName}@${PackageVersion}`)
    FS.mkdirpSync(OutputFolder)
    const TarFile = DownloadPackageArchive(PackageName, PackageVersion)

    Tar.extract(
        {
            file: TarFile,
            sync: true,
            cwd: UnpackFolder,
            preserveOwner: false
        }
    )

    TypeWriter.Logger.Debug(`Moving files from ${PackageName}`)
    const MoveFolder = FindClosest(UnpackFolder, "package.json")

    for (const FileName of FS.readdirSync(MoveFolder)) {
        var Moved = false
        while (Moved == false) {
            try {
                FS.moveSync(
                    `${MoveFolder}/${FileName}`,
                    `${OutputFolder}/${FileName}`
                )
                Moved = true
            } catch (E) {
                TypeWriter.Logger.Warning(`Could not move downloaded package (${E})`)
            }
        }
    }

    return OutputFolder
}

function DownloadPackage(PackageName, PackageVersion) {
    PackageName = PackageName.toLowerCase()
    const PackageFolder = GetModuleFolder(PackageName)
    CreatePackageFolders(PackageName)

    if (FS.existsSync(`${PackageFolder}/Versions/${PackageVersion}`)) {
        TypeWriter.Logger.Debug(`Package version ${PackageName}@${PackageVersion} is already in the cache`)
        return `${PackageFolder}/Versions/${PackageVersion}`
    }

    const PackageInfo = GetPackageInfo(PackageName, PackageVersion)

    const DependencyFolders = {}
    for (const DependencyName in PackageInfo.dependencies) {
        const DependencyVersion = PackageInfo.dependencies[DependencyName]
        DependencyFolders[DependencyName] = DownloadPackage(DependencyName, DependencyVersion)
    }

    const UnpackedFolder = UnpackPackageArchive(PackageInfo.name, PackageInfo.version)

    FS.ensureDirSync(`${UnpackedFolder}/node_modules/`)
    for (const DependencyName in DependencyFolders) {
        const DependencyFolder = DependencyFolders[DependencyName]
        const SplitDependencyName = DependencyName.split("/")
        if (SplitDependencyName.length == 2) {
            FS.ensureDirSync(`${UnpackedFolder}/node_modules/${SplitDependencyName[0]}`)
        }
        FS.symlinkSync(
            DependencyFolder,
            `${UnpackedFolder}/node_modules/${DependencyName}`,
            TypeWriter.OS == "win32" ? 'junction' : 'dir'
        )
    }

    if (PackageInfo.scripts.postInstall) {
        const InstallScript = PackageInfo.scripts.postinstall
        const SplitScript = InstallScript.split(" ")
        if (SplitScript[0] == "node") {
            TypeWriter.Logger.Debug(`Running postinstall script for ${PackageName}`)
            require("child_process").execFileSync(
                TypeWriter.Executable,
                ["runscript", "-i", Path.join(OutputFolder, SplitScript[1])],
                {
                    cwd: `${OutputFolder}`,
                    stdio: "inherit"
                }
            )
        }
    }

    TypeWriter.Logger.Debug(`Done getting ${PackageName}`)
    return UnpackedFolder
}

function LoadPackage(PackageName, PackageVersion, ExecuteDirectory) {
    const ModulesFolder = `${ExecuteDirectory}/node_modules/`
    const PackageFolder = DownloadPackage(PackageName, PackageVersion)
    FS.ensureDirSync(ModulesFolder)

    if (PackageName.split("/").length == 2) {
        FS.ensureDirSync(`${ModulesFolder}/${PackageName.split("/")[0]}`)
    }
    FS.symlinkSync(PackageFolder, `${ModulesFolder}/${PackageName}`, TypeWriter.OS == "win32" ? 'junction' : 'dir') // https://github.com/pnpm/symlink-dir/blob/main/src/index.ts#L10
}

function GetLatestPackageVersion(PackageName) {
    return JsonRequest(`https://unpkg.com/${PackageName}/package.json`).Data.version
}

function PackageExists(PackageName) {
    if (FS.existsSync(GetModuleFolder(PackageName))) {
        return true
    } else {
        const Exists = JsonRequest(`https://unpkg.com/${PackageName}/package.json`).Response.status == 200
        if (Exists) {
            CreatePackageFolders(PackageName)
            return true
        }
    }

    return false
}

module.exports = {
    DownloadPackage: DownloadPackage,
    LoadPackage: LoadPackage,
    GetLatestPackageVersion: GetLatestPackageVersion,
    PackageExists: PackageExists,
    GetPackageFolder: function(PackageName, PackageVersion) {
        return `${GetModuleFolder(PackageName)}/Versions/${PackageVersion}/`
    }
}