const Path = require("path")
const RequireFromString = require("require-from-string")
const FS = require("fs-extra")

module.exports.Name = "RunScript"
module.exports.Execute = function() {
    const InputPath = TypeWriter.Arguments.input
    
    RequireFromString(
        FS.readFileSync(InputPath, "utf-8"),
        Path.normalize(InputPath)
    )
}