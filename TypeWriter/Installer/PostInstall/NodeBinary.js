const FS = require("fs-extra")
const FSHelpers = require("../../Lib/FSHelpers")
const Path = require("path")
const Unzip = require("extract-zip")
const Tar = require("tar")
const Fetch = require("node-fetch")

const NodeBinariesFolder = `${TypeWriter.Folder}/Binaries/Node/`

function GetStoredNodeVersion() {
    var StoredNodeVersion
    try {
        StoredNodeVersion = FS.readFileSync(`${NodeBinariesFolder}/Version.txt`)
    } catch (error) {
        StoredNodeVersion = "Unknown"
    }
    return StoredNodeVersion
}

module.exports = async function () {
    const NodeVersion = process.versions.node
    const StoredNodeVersion = GetStoredNodeVersion()

    TypeWriter.Logger.Debug(`Node version: ${NodeVersion} Stored: ${StoredNodeVersion}`)

    if (NodeVersion == StoredNodeVersion) { return }

    FS.removeSync(NodeBinariesFolder)
    FS.ensureDirSync(NodeBinariesFolder)

    const DownloadFileName = `node-v${NodeVersion}-${TypeWriter.OS == "win32" ? "win" : TypeWriter.OS}-${process.arch}.${TypeWriter.OS == "win32" ? "zip" : "tar.gz"}`
    const DownloadLink = `https://nodejs.org/dist/v${NodeVersion}/${DownloadFileName}`

    TypeWriter.Logger.Information(`Downloading Node.js...`)

    const Download = await Fetch(DownloadLink)
    const DownloadedFileName = `${NodeBinariesFolder}/Node.${TypeWriter.OS == "win32" ? "zip" : "tar.gz"}`

    FS.writeFileSync(DownloadedFileName, await Download.buffer())

    if (TypeWriter.OS != "win32") {
        await Tar.x(
            {
                file: DownloadedFileName,
                cwd: NodeBinariesFolder
            }
        )
    } else {
        await Unzip(
            DownloadedFileName,
            {
                dir: NodeBinariesFolder
            }
        )
    }

    const UnzippedFolder = Path.join(
        NodeBinariesFolder,
        FS.readdirSync(NodeBinariesFolder).find(F => !F.endsWith(".zip") && !F.endsWith(".tar.gz"))
    )

    FSHelpers.MoveFilesInFolder(
        UnzippedFolder,
        NodeBinariesFolder
    )

    FS.removeSync(UnzippedFolder)

}