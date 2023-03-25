const FS = require("fs-extra")
const Fetch = require("sync-fetch")
const Path = require("path")
const Tar = require("tar")
const KlawSync = require("klaw-sync")
const SemVer = require("semver")
const Base64 = require("js-base64")
const JsonRequest = require("../../JsonRequest")
const RequireString = require("require-from-string")

const CacheFolder =         `${TypeWriter.Folder}/Cache/ModuleCache/NPM/`
const ModulesFolder =       `${CacheFolder}/Modules/`
const ModuleTarsFolder =    `${CacheFolder}/ModuleTars/`
const UnpackFolder =        `${CacheFolder}/Unpack/`

function GetCacheFolder(PackageName) {
    return `${CacheFolder}/${Base64.encode(PackageName)}`
}

function GetPackageInfo(PackageName, PackageVersion) {
    return JsonRequest(
        `https://nva.corebyte.me/version?q=${PackageName}&v=${PackageVersion}`
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
    const PackageFolder = GetCacheFolder(PackageName)
    if (FS.existsSync(PackageFolder)) {return}
    FS.mkdirSync(PackageFolder)
    FS.mkdirSync(`${PackageFolder}/Versions`)
    FS.writeFileSync(`${PackageFolder}/${PackageName.replaceAll("/", "-")}`, "")
    FS.writeJSONSync(
        `${PackageFolder}/PackageInfo.json`,
        {
            Name: PackageName
        }
    )
}

function DownloadPackage(Name, Version) {
    Name = Name.toLowerCase()
    const PackageFolder = GetCacheFolder(Name)
    CreatePackageFolders(Name)

    if (FS.existsSync(`${PackageFolder}/Versions/${Version}`)) {
        TypeWriter.Logger.Debug(`Package version ${Name}@${Version} is already in the cache`)
        return `${PackageFolder}/Versions/${Version}`
    }

    const PackageInfo = GetPackageInfo(Name, Version).VersionData

    const OutputFolder = `${PackageFolder}/Versions/${PackageInfo.version}/`
    if (FS.existsSync(OutputFolder)) {
        return OutputFolder
    }
    FS.mkdirSync(OutputFolder)
    FS.mkdirSync(`${OutputFolder}/node_modules/`)

    const DependencyTree = {}
    for (const Dependency in PackageInfo.dependencies) {
        const DependencyVersion = PackageInfo.dependencies[Dependency]
        DependencyTree[Dependency] = GetPackageInfo(Dependency, DependencyVersion).Version
        const DownloadedPath = DownloadPackage(Dependency, DependencyVersion, false)
        if (Dependency.split("/").length == 2) {
            FS.ensureDirSync(`${OutputFolder}/node_modules/${Dependency.split("/")[0]}`)
        }
        FS.symlinkSync(DownloadedPath, `${OutputFolder}/node_modules/${Dependency}`, TypeWriter.OS == "win32" ? 'junction' : 'dir') // https://github.com/pnpm/symlink-dir/blob/main/src/index.ts#L10
    }
    FS.writeJSONSync(`${OutputFolder}/DependencyTree.json`, DependencyTree, {spaces: "\t"})
    
    TypeWriter.Logger.Information(`Downloading package ${Name} version ${PackageInfo.version}`)

    const FetchData = Fetch(PackageInfo.dist.tarball)
    const OutputFile = `${OutputFolder}/TarBall.tgz`
    FS.mkdirpSync(Path.dirname(OutputFile))
    FS.writeFileSync(OutputFile, FetchData.buffer())

    TypeWriter.Logger.Debug(`Extracting ${Name}`)
    Tar.extract(
        {
            file: OutputFile,
            sync: true,
            cwd: UnpackFolder,
            preserveOwner: false
        }
    )

    TypeWriter.Logger.Debug(`Moving files from ${Name}`)
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

    if (PackageInfo.hasInstallScript) {
        const PackageData = FS.readJSONSync(`${OutputFolder}/package.json`)
        const InstallScript = PackageData.scripts.postinstall
        const SplitScript = InstallScript.split(" ")
        if (SplitScript[0] == "node") {
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

    TypeWriter.Logger.Debug(`Done getting ${Name}`)
    return OutputFolder
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
    if (FS.existsSync(GetCacheFolder(PackageName))) {
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
        return `${GetCacheFolder(PackageName)}/Versions/${PackageVersion}/`
    }
}