const FS = require("fs-extra")
const Path = require("path")
const LoadEnvoirment = require("../../Lib/LoadEnvoirment")
const RandomString = require("../../Lib/RandomString.js")


module.exports.Name = "Execute"
module.exports.Execute = async function() {
    const InputPath = TypeWriter.Arguments.input
    const ExecuteId = RandomString(32)
    const ExecuteFolder = Path.normalize(`${TypeWriter.InstallationFolder}/Cache/ExecuteCache/${ExecuteId}/`)
    FS.mkdirSync(ExecuteFolder)

    TypeWriter.Logger.Debug(`Input is ${InputPath}`)
    TypeWriter.Logger.Debug(`ExecuteId is ${ExecuteId}`)
    TypeWriter.Logger.Debug(`ExecuteFolder is ${ExecuteFolder}`)
    
    await LoadEnvoirment(ExecuteFolder)
    const Package = await TypeWriter.PackageManager.LoadPackage(InputPath)
    await Package.LoadEntrypoint("Main")
}