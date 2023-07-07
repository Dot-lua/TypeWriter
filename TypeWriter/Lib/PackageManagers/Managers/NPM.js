const FS = require("fs-extra")
const FSHelpers = require("../../FSHelpers")
const JsonRequest = require("../../JsonRequest")
const Fetch = require("sync-fetch")
const Tar = require("tar")
const Path = require("path")

const CacheFolder = `${TypeWriter.Folder}/Cache/ModuleCache/NPM/`
const ModulesFolder = `${CacheFolder}/Modules/`
const ModuleTarsFolder = `${CacheFolder}/ModuleTars/`
const UnpackFolder = `${CacheFolder}/Unpack/`
const MainFileName = require("require-main-filename")()
const InstallScriptNames = ["preinstall", "install", "postinstall"]

function DownloadLinkFromPackage(Package) {
    var AuthorLessName = Package.name
    if (Package.name.startsWith("@")) {
        AuthorLessName = Package.name.split("/")[1]
    }
    return `https://registry.npmjs.org/${Package.name}/-/${AuthorLessName}-${Package.version}.tgz`
}

function MoveFrom(FromPath, ToPath) {
    for (const FileName of FS.readdirSync(FromPath)) {
        while (true) {
            try {
                FS.moveSync(`${FromPath}/${FileName}`, `${ToPath}/${FileName}`)
                break
            } catch (error) {
                TypeWriter.Logger.Warning(`Failed to move ${FileName} from ${FromPath} to ${ToPath}`)
            }
        }
    }
}

class NPM {
    constructor() {

    }

    GetPackageFolder(Dependency, Version = true, CreateFolder = true) {
        var FullName = Dependency.FullName
        if (Dependency.Author) {
            FullName = `@${Dependency.FullName}`
        }

        var ModuleFolder = `${ModulesFolder}/${FullName}`

        if (CreateFolder) {
            FS.ensureDirSync(`${ModuleFolder}/Versions/`)
        }
        if (Version) {
            ModuleFolder += `/Versions/${Dependency.Version}`
        }
        if (CreateFolder) {
            FS.ensureDirSync(ModuleFolder)
        }

        return ModuleFolder
    }

    PackageCached(Dependency) {
        return FS.existsSync(this.GetPackageFolder(Dependency, true, false))
    }

    PackageExists(Dependency) {
        if (FS.existsSync(this.GetPackageFolder(Dependency, false, false))) {
            return true
        }

        const Exists = JsonRequest(`https://cdn.jsdelivr.net/npm/${Dependency.AtFullName}/package.json`).Response.status == 200
        if (Exists) {
            this.GetPackageFolder(Dependency, false, true)
        }
        return Exists
    }

    LatestPackageVersion(Dependency) {
        return JsonRequest(`https://cdn.jsdelivr.net/npm/${Dependency.AtFullName}/package.json`).Data.version
    }

    PackageInformation(Dependency) {
        return JsonRequest(`https://cdn.jsdelivr.net/npm/${Dependency.AtFullName}@${Dependency.Version}/package.json`).Data
    }

    DownloadPackage(Dependency, ParentPackage = "None") {
        var PackageFolder = this.GetPackageFolder(Dependency, true, false)

        if (FS.existsSync(PackageFolder)) {
            TypeWriter.Logger.Debug(`Package ${Dependency.String} already downloaded`)
            return PackageFolder
        }

        const PackageInfo = this.PackageInformation(Dependency)
        Dependency.Version = PackageInfo.version
        var PackageFolder = this.GetPackageFolder(Dependency, true, false)

        if (FS.existsSync(PackageFolder)) {
            TypeWriter.Logger.Debug(`Package ${Dependency.String} already downloaded`)
            return PackageFolder
        }
        FS.mkdirpSync(PackageFolder)

        var NodeModulesFolder = `${PackageFolder}/node_modules/`
        FS.ensureDirSync(NodeModulesFolder)

        for (const DependencyName in PackageInfo.dependencies) {
            const DependencyVersion = PackageInfo.dependencies[DependencyName]
            const DependencyData = {
                Version: DependencyVersion
            }
            if (DependencyName.startsWith("@")) {
                DependencyData.Author = DependencyName.split("/")[0].substring(1)
                DependencyData.Name = DependencyName.split("/")[1]
                DependencyData.FullName = `${DependencyData.Author}/${DependencyData.Name}`
                DependencyData.AtFullName = `@${DependencyData.Author}/${DependencyData.Name}`
            } else {
                DependencyData.Name = DependencyName
                DependencyData.FullName = DependencyName
                DependencyData.AtFullName = DependencyName
            }

            const DependencyFolder = this.DownloadPackage(DependencyData, Dependency.FullName)

            if (DependencyData.Author) {
                FS.ensureDirSync(`${NodeModulesFolder}/@${DependencyData.Author}`)
            }
            FS.symlinkSync(
                DependencyFolder,
                `${NodeModulesFolder}/${DependencyData.AtFullName}`,
                TypeWriter.OS == "win32" ? 'junction' : 'dir'
            )
        }

        const DownloadLink = DownloadLinkFromPackage(PackageInfo)

        const TarFile = `${ModuleTarsFolder}/${Dependency.AtFullName}/${Dependency.Version}.tgz`
        if (!FS.existsSync(TarFile)) {
            FS.ensureDirSync(`${ModuleTarsFolder}/${Dependency.AtFullName}`)
            TypeWriter.Logger.Information(`Downloading ${Dependency.FullName}@${Dependency.Version}`)
            const DownloadedTar = Fetch(DownloadLink).buffer()
            FS.writeFileSync(TarFile, DownloadedTar)
        }

        TypeWriter.Logger.Information(`Unpacking ${Dependency.FullName}@${Dependency.Version}`)
        Tar.extract(
            {
                file: TarFile,
                sync: true,
                cwd: UnpackFolder,
                preserveOwner: false
            }
        )

        const MoveFolder = FSHelpers.FindDown(UnpackFolder, "package.json")
        TypeWriter.Logger.Information(`Moving ${Dependency.FullName}@${Dependency.Version}`)
        MoveFrom(MoveFolder, PackageFolder)

        var InstallScript
        for (const ScriptName of InstallScriptNames) {
            if ((PackageInfo.scripts || {})[ScriptName]) {
                InstallScript = PackageInfo.scripts[ScriptName]
            }
        }

        if (InstallScript) {
            const SplitScript = InstallScript.split(" ")
            if (SplitScript[0] == "node") {
                TypeWriter.Logger.Information(`Running install script for ${Dependency.FullName}@${Dependency.Version}`)
                require("child_process").execFileSync(
                    TypeWriter.Executable,
                    [MainFileName, "runscript", "-i", Path.join(PackageFolder, SplitScript[1])],
                    {
                        cwd: `${PackageFolder}`,
                        stdio: "inherit"
                    }
                )
            }
        }

        return PackageFolder

    }

    PackageFolder(Dependency) {
        return this.GetPackageFolder(Dependency, true, false)
    }

    LoadPackage(Dependency, ExecuteDirectory) {
        const PackageFolder = this.GetPackageFolder(Dependency, true, false)
        if (!FS.existsSync(PackageFolder)) {
            this.DownloadPackage(Dependency)
        }
    }
}

module.exports = NPM