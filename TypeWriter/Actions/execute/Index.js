const FS = require("fs-extra")
const RandomString = require("randomstring")
const Path = require("path")
const LoadEnvoirment = require("../../Lib/LoadEnvoirment")

module.exports.Name = "Execute"
module.exports.Execute = async function() {
    const InputPath = TypeWriter.Arguments.input
    const ExecuteId = RandomString.generate(32)
    const ExecuteFolder = Path.normalize(`${TypeWriter.Folder}/Cache/ExecuteCache/${ExecuteId}/`)

    TypeWriter.Logger.Debug(`Input is ${InputPath}`)
    TypeWriter.Logger.Debug(`ExecuteId is ${ExecuteId}`)
    TypeWriter.Logger.Debug(`ExecuteFolder is ${ExecuteFolder}`)
    
    FS.mkdirSync(ExecuteFolder)

    await LoadEnvoirment(ExecuteFolder)
    const Package = TypeWriter.LoadFile(InputPath)
    TypeWriter.LoadEntrypoint(Package.Id, "Main")
}