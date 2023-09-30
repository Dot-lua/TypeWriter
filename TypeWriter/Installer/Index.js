const FS = require("fs-extra")

module.exports = {
    Install: async function () {
        var InstallLocation
        if (TypeWriter.OS == "win32") {
            InstallLocation = `${process.env.APPDATA}/.TypeWriter/`
        } else {
            InstallLocation = `${process.env.HOME}/.TypeWriter/`
        }

        FS.ensureDirSync(InstallLocation)

        await (require("./Install/RemoveOldFiles"))(InstallLocation)

        FS.mkdirSync(`${InstallLocation}/Cache`)
        FS.writeFileSync(`${InstallLocation}/InstallationDirectory`, "")
        const ExecutablePath = `${InstallLocation}/typewriter${TypeWriter.OS == "win32" ? ".exe" : ""}`
        FS.copySync(process.argv0, ExecutablePath)

        await (require("./Install/AddToPath"))(InstallLocation)
    },

    PostInstall: async function() {
        // await (require("./PostInstall/NodeBinary"))()
    }
}