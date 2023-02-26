
module.exports.Name = "Build"
module.exports.Execute = function() {
    const InputPath = TypeWriter.Arguments.input
    const InputBranch = TypeWriter.Arguments.branch

    const BuildHelper = require("../../Lib/BuildHelper.js")

    console.log(InputPath)

    const BuildId = BuildHelper.Build(InputPath, InputBranch)
    BuildHelper.CompressBuild(BuildId, TypeWriter.Arguments.output)
    BuildHelper.CleanupBuild(BuildId)
}