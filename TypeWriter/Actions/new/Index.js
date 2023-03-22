const FS = require("fs-extra")
const Path = require("path")

module.exports.Name = "New"
module.exports.Execute = function() {
    if (FS.existsSync("./src/")) {
        TypeWriter.Logger.Error("The ./src/ folder already exists, please remove it before trying again.")
        process.exit(1)
    }

    FS.mkdirpSync("./src/Main/js/me/corebyte/template/")
    FS.mkdirpSync("./src/Main/lua/me/corebyte/template/")
    FS.mkdirpSync("./src/Main/resources/")
    FS.copySync(Path.join(__dirname, "../../Assets/package.info.json"), "./src/Main/package.info.json")
    FS.writeFileSync("./src/Main/lua/me/corebyte/template/Main.lua", "print(\"Hello lua world\")")
    FS.writeFileSync("./src/Main/js/me/corebyte/template/JsMain.js", "console.log(\"Hello js world\")")

    TypeWriter.Logger.Information("The ./src/ is now created but you still need to edit the package.info.json.")

}