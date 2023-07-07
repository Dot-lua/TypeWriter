const Path = require("path")

module.exports = async function(ExecuteFolder) {
    await require("./Load.js")(ExecuteFolder)

    TypeWriter.Lua.LoadFile(
        Path.join(__dirname, "./Load.lua")
    )
}