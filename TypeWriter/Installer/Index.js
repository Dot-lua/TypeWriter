const FS = require("fs-extra")
const Path = require("path")

function InstallLocation() {
    if (process.env.TYPEWRITER_INSTALL_DIR) {
        return Path.resolve(process.env.TYPEWRITER_INSTALL_DIR)
    } else if (TypeWriter.OS == "win32") {
        return `${process.env.APPDATA}/.TypeWriter/`
    } else {
        return `${process.env.HOME}/.TypeWriter/`
    }
}

module.exports = function () {
    if (FS.existsSync(`${TypeWriter.InstallationFolder}/InstallationDirectory`)) { return }

    const InstallationDirectory = InstallLocation()

    TypeWriter.Logger.Information(`Installing TypeWriter to '${InstallationDirectory}'`)

    FS.ensureDirSync(InstallationDirectory)

    require("./Helpers/RemoveOldFiles")(InstallationDirectory)

    FS.writeFileSync(`${InstallationDirectory}/InstallationDirectory`, "")
    const ExecutablePath = `${InstallationDirectory}/typewriter${TypeWriter.OS == "win32" ? ".exe" : ""}`
    FS.copySync(process.argv0, ExecutablePath)

    if (process.env.TYPEWRITER_INSTALL_NO_PATH) { process.exit(0) }

    require("./Helpers/AddToPath")(InstallationDirectory)

    process.exit(0)
}