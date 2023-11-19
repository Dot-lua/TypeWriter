module.exports = async function LoadLanguages(Parent) {
    Parent.JavaScript = await require("./JavaScript/Index.js")()
    Parent.Lua = await require("./Lua/Index.js")()
}