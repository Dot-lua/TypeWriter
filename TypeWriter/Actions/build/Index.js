const BuilderClass = require("../../Classes/Builder.js")

module.exports.Name = "Build"
module.exports.Execute = async function() {
    const InputPath = TypeWriter.Arguments.input
    const InputBranch = TypeWriter.Arguments.branch
    const OutputPath = TypeWriter.Arguments.output

    const Builder = new BuilderClass(InputPath, InputBranch, OutputPath)
    await Builder.ValidatePackageInfo()
    await Builder.ScanCode()
    await Builder.ScanResources()
    await Builder.Compress()
    await Builder.Cleanup()
}