const FS = require("fs-extra")
const Path = require("path")

const BuilderClass = require("../../Classes/Builder.js")
const LoadEnvoirment = require("../../Lib/LoadEnvoirment")
const RandomString = require("../../Lib/RandomString.js")

module.exports.Name = "Run"
module.exports.Execute = async function() {
    const InputPath = TypeWriter.Arguments.input
    const InputBranch = TypeWriter.Arguments.branch

    const ExecuteId = RandomString(32)
    const ExecuteFolder = Path.normalize(`${TypeWriter.Folders.Cache.ExecuteCacheFolder}/${ExecuteId}/`)
    FS.mkdirSync(ExecuteFolder)

    TypeWriter.Logger.Debug(`ExecuteId is ${ExecuteId}`)
    TypeWriter.Logger.Debug(`ExecuteFolder is ${ExecuteFolder}`)

    const Builder = new BuilderClass(InputPath, InputBranch, ExecuteFolder)
    await Builder.ValidatePackageInfo()
    await Builder.ScanCode()
    await Builder.ScanResources()
    const OutputFile = await Builder.Compress()
    await Builder.Cleanup()

    await LoadEnvoirment(ExecuteFolder)
    const Package = await TypeWriter.PackageManager.LoadPackage(OutputFile)
    await Package.LoadEntrypoint("Main")
}