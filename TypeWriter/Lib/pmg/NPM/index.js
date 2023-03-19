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
    const Versions = JsonRequest(`http://nva.corebyte.me:4431/versions/?q=${Name}`).versions
    return SemVer.maxSatisfying(Versions, Version)
}

function GetPackageInfo(Name, Version) {
    if (Version == undefined) {
        Version = "latest"
    } else {
        TypeWriter.Logger.Debug(`Getting ${Name} Version`)
        Version = GetSatisfyingVersion(Name, Version)
    }

    TypeWriter.Logger.Debug(`Requesting data`)
    const Data = JsonRequest(`https://registry.npmjs.org/${Name}/${Version}`)
    if (Data == "Not Found") {
        return false
    }
    return Data
}

function DownloadPackage(Name, Version) {
    Name = Name.toLowerCase()
    TypeWriter.Logger.Debug(`Checking if ${Name} exists`)

    var PackageExists = PackageExists(Name)
    if (!PackageExists(Name)) {
        TypeWriter.Logger.Error(`Failed to find NPM package ${Name}, please fix!`)
        process.exit(1)
    }

    const PackageInfo = GetPackageInfo(Name, Version)
    for (const Dependency in PackageInfo.dependencies) {
        DownloadPackage(Dependency, PackageInfo.dependencies[Dependency])
    }

    const PackageFolder = GetCacheFolder(Name)
    const OutputFolder = `${PackageFolder}/Versions/${PackageInfo.version}/`
    if (FS.existsSync(OutputFolder)) {
        return
    }
    FS.mkdirSync(OutputFolder)
    TypeWriter.Logger.Information(`Downloading package ${Name} version ${PackageInfo.version}`)

    const FetchData = Fetch(PackageInfo.dist.tarball)
    const OutputFile = `${OutputFolder}/${Name}.tgz`
    console.log(OutputFile)
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
        FS.moveSync(
            `${MoveFolder}/${FileName}`,
            `${OutputFolder}/${FileName}`
        )
    }
    TypeWriter.Logger.Debug(`Done getting ${Name}`)
}

function LoadPackage(PackageName, PackageVersion, ExecuteDirectory) {
    console.log(PackageName)
    console.log(PackageVersion)
    console.log(ExecuteDirectory)
    DownloadPackage(PackageName, PackageVersion)
}

function GetLatestPackageVersion(PackageName) {

}

module.exports = {
    DownloadPackage: DownloadPackage,
    LoadPackage: LoadPackage,
    GetLatestPackageVersion: GetLatestPackageVersion
}