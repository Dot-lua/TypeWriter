const JsonRequest = require("../../JsonRequest")
const FS = require("fs-extra")
const Fetch = require("sync-fetch")
const Path = require("path")
const Tar = require("tar")
const KlawSync = require("klaw-sync")
const SemVer = require("semver")

const CacheFolder = `${TypeWriter.Folder}/Cache/ModuleCache/NPM/`
const UnpackFolder = `${TypeWriter.Folder}/Cache/ModuleCache/Unpack/`

function EncodePackageName(Name) {
    return Base64.encode(Name)
}

function GetCacheFolder(Name) {
    return `${CacheFolder}/${EncodePackageName(Name)}`
}

function PackageExists(Name) {
    const PackagePath = GetCacheFolder(Name)
    if (FS.existsSync(PackagePath)) {
        return true
    }
    if (GetPackageInfo(Name)) {
        FS.mkdirSync(PackagePath)
        FS.mkdirSync(`${PackagePath}/Versions/`)
        FS.writeJSONSync(
            `${PackagePath}/PackageInfo.json`,
            {
                Name: Name
            }
        )
        return true
    }
    return false
}

function GetSatisfyingVersion(Name, Version) {
    const Versions = Object.keys(JsonRequest(`https://registry.npmjs.org/${Name}`).versions)
    return SemVer.maxSatisfying(Versions, Version)
}

function GetPackageInfo(Name, Version) {
    if (Version == undefined) {
        Version = "latest"
    } else {
        Version = GetSatisfyingVersion(Name, Version)
    }

    const Data = JsonRequest(`https://registry.npmjs.org/${Name}/${Version}`)
    if (Data == "Not Found") {
        return false
    }
    return Data
}

function DownloadPackage(Name, Version) {
    if (!FS.existsSync(`${CacheFolder}/${Name}/`)) {
        TypeWriter.Logger.Debug(`${Name} is not in the cache`)
        TypeWriter.Logger.Information(`Downloading NPM package ${Name}.`)
    } else {
        TypeWriter.Logger.Debug(`${Name} is already cached`)
        return 
    }

    const PackageInfo = GetPackageInfo(Name, Version)
    for (const Dependency in PackageInfo.dependencies) {
        DownloadPackage(Dependency, PackageInfo.dependencies[Dependency])
    }

    const FetchData = Fetch(PackageInfo.dist.tarball)
    const OutputFile = `${CacheFolder}/${Name}.tgz`
    FS.mkdirpSync(Path.dirname(OutputFile))
    FS.writeFileSync(OutputFile, FetchData.buffer())

    Tar.extract(
        {
            file: OutputFile,
            sync: true,
            cwd: UnpackFolder
        }
    )

    const OutputFolder = CacheFolder + Name
    if (FS.existsSync(OutputFolder)) {
        FS.rmdirSync(OutputFolder)
    }

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

    FS.moveSync(MoveFolder, OutputFolder)
}

module.exports = DownloadPackage