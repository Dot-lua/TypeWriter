const FS = require("fs-extra")
const Path = require("path")

function RemoveFileOrFolder(FolderPath) {
    TypeWriter.Logger.Info(`Removing file ${Path.resolve(FolderPath)}`)
    return FS.removeSync(FolderPath)
}

module.exports = async function(InstallLocation) {
    //Remove Old v5 files
    if (FS.existsSync(`${InstallLocation}/SessionStorage`)) {
        TypeWriter.Logger.Info("Found existing v5 installation, removing old files.")
        RemoveFileOrFolder(`${InstallLocation}/Binary`)
        RemoveFileOrFolder(`${InstallLocation}/Config`)
        RemoveFileOrFolder(`${InstallLocation}/Internal`)
        RemoveFileOrFolder(`${InstallLocation}/PackageCache`)
        RemoveFileOrFolder(`${InstallLocation}/SessionStorage`)
        RemoveFileOrFolder(`${InstallLocation}/Temp`)
        RemoveFileOrFolder(`${InstallLocation}/TypeWriter`)
    }

    //Remove v6 cache files

    if (FS.existsSync(`${InstallLocation}/InstallationDirectory`)) {
        TypeWriter.Logger.Info("Found existing v6 installation, removing cache folder.")
        RemoveFileOrFolder(`${InstallLocation}/Cache`)
    }
}