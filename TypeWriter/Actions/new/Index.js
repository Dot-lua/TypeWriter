const FS = require("fs-extra")

module.exports.Name = "New"
module.exports.Execute = function() {
    if (FS.existsSync("./src/")) {
        TypeWriter.Logger.Error("The ./src/ folder already exists, please remove it before trying again.")
        process.exit(1)
    }

    FS.mkdirp("./src/Main/js/me/corebyte/template/")
    FS.mkdirp("./src/Main/lua/me/corebyte/template/")
    FS.mkdirp("./src/Main/resources/")
    FS.copySync(require("path").join(__dirname, "../../Assets/package.info.json"), "./src/Main/package.info.json")
    FS.writeFileSync("./src/Main/lua/me/corebyte/template/Main.lua", "print(\"Hello lua world\")")
    FS.writeFileSync("./src/Main/js/me/corebyte/template/JsMain.js", "console.log(\"Hello js world\")")

    TypeWriter.Logger.Information("The ./src/ is now created but you still need to edit the package.info.json.")

}