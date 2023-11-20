const Path = require("path")
const FS = require("fs-extra")
const Fetch = require("node-fetch")

async function FetchFile(Url, File) {
    try {
        if (FS.existsSync(File)) { return }
        const Response = await Fetch(Url)
        const Content = await Response.text()
        FS.mkdirpSync(Path.dirname(File))
        FS.writeFileSync(File, Content)
    } catch (error) {
        TypeWriter.Logger.Warning(`Failed to fetch '${Url}' (${error})`)
        return await FetchFile(Url, File)
    }
    
}

module.exports = FetchFile