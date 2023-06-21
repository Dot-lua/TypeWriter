const BuildHelper = require("../../Lib/BuildHelper.js")

module.exports.Name = "Build"
module.exports.Execute = function() {
    const InputPath = TypeWriter.Arguments.input
    const InputBranch = TypeWriter.Arguments.branch

    const BuildId = BuildHelper.Build(InputPath, InputBranch)
    BuildHelper.CompressBuild(BuildId, TypeWriter.Arguments.output)
    BuildHelper.CleanupBuild(BuildId)
}