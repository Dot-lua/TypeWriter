const Path = require("path")

module.exports = async function(ExecuteFolder) {
    await require("./Load.js")(ExecuteFolder)

    if (!global.TypeWriterDisableLua) {
        TypeWriter.Lua.LoadFile(
            Path.join(__dirname, "./Load.lua")
        )
    }

}