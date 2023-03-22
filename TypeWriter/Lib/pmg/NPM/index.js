const FS = require("fs-extra")
const Fetch = require("sync-fetch")
const Path = require("path")
const Tar = require("tar")
const KlawSync = require("klaw-sync")
const SemVer = require("semver")
const Base64 = require("js-base64")
const JsonRequest = require("../../JsonRequest")

const CacheFolder = `${TypeWriter.Folder}/Cache/ModuleCache/NPM/`
const UnpackFolder = `${TypeWriter.Folder}/Cache/ModuleCache/Unpack/`

function EncodePackageName(Name) {
    return Base64.encode(Name)
}

function GetCacheFolder(Name) {
    return `${CacheFolder}/${EncodePackageName(Name)}`
}

function GetPackageInfo(PackageName, PackageVersion) {
    return JsonRequest(
        `https://nva.corebyte.me/version?q=${PackageName}&v=${PackageVersion}`
    )
}

function DownloadPackage(Name, Version, CheckExists=true) {
    Name = Name.toLowerCase()
    const PackageFolder = GetCacheFolder(Name)
    {
        var CreateFolders = false
        if (!FS.existsSync(PackageFolder)) {
            if (CheckExists) {
                TypeWriter.Logger.Debug(`Checking if ${Name} exists`)
                const PackageExists = JsonRequest(`https://nva.corebyte.me/exists/?q=${Name}`)
                if (!PackageExists) {
                    TypeWriter.Logger.Error(`NPM package ${Name} does not exist, please fix!`)
                    process.exit(1)
                }
                CreateFolders = true
            } else {
                CreateFolders = true
            }
        }

        if (CreateFolders) {
            FS.mkdirSync(PackageFolder)
            FS.mkdirSync(`${PackageFolder}/Versions`)
            FS.writeFileSync(`${PackageFolder}/${Name.replaceAll("/", "-")}`, "")
            FS.writeJSONSync(
                `${PackageFolder}/PackageInfo.json`,
                {
                    Name: Name
                }
            )
        }
    }
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
    const FileList = KlawSync(
        UnpackFolder,
        {
            nodir: true,
            preserveOwner: false
        }
    )
    const MoveFolder = Path.dirname(FileList.filter(
        function(File) {
            return Path.basename(File.path) == "package.json"
        }
    ).reduce(
        function(a, b) {
            return a.path.length <= b.path.length ? a : b;
        }
    ).path)

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
    return JsonRequest(`https://registry.npmjs.org/${PackageName}/latest`).version
}

module.exports = {
    DownloadPackage: DownloadPackage,
    LoadPackage: LoadPackage,
    GetLatestPackageVersion: GetLatestPackageVersion,
    GetPackageFolder: function(PackageName, PackageVersion) {
        return `${GetCacheFolder(PackageName)}/Versions/${PackageVersion}`
    }
}