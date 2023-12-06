module.exports = async function LoadLanguages(Parent) {
    Parent.JavaScript = await require("./JavaScript/Index.js")()
    if (!global.TypeWriterDisableLua) {
        Parent.Lua = await require("./Lua/Index.js")()
    }
}