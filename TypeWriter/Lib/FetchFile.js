const Path = require("path")
const FS = require("fs-extra")
const Fetch = require("node-fetch")

async function FetchFile(Url, File) {
    try {
        if (FS.existsSync(File)) { return }
        FS.mkdirpSync(Path.dirname(File))
        const Response = await Fetch(Url)
        const Buffer = await Response.buffer()
        FS.writeFileSync(File, Buffer, "utf8")
    } catch (error) {
        TypeWriter.Logger.Warning(`Failed to fetch '${Url}' (${error})`)
        return await FetchFile(Url, File)
    }
}

module.exports = FetchFile