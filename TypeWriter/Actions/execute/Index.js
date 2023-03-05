const FS = require("fs-extra")
const RandomString = require("randomstring")
const Path = require("path")
const Tar = require("tar")
const RuntimeHelper = require("../../Lib/RuntimeHelper")

module.exports.Name = "Execute"
module.exports.Execute = function() {
    const InputPath = TypeWriter.Arguments.input
    TypeWriter.Logger.Debug(`Input is ${InputPath}`)
    const ExecuteId = RandomString.generate(32)
    TypeWriter.Logger.Debug(`ExecuteId is ${ExecuteId}`)
    const ExecuteFolder = Path.normalize(`${TypeWriter.Folder}/Cache/ExecuteCache/${ExecuteId}/`)
    TypeWriter.Logger.Debug(`ExecuteFolder is ${ExecuteFolder}`)
    
    FS.mkdirSync(ExecuteFolder)

    RuntimeHelper.LoadEnvoirment(ExecuteFolder)
    const Package = TypeWriter.LoadFile(InputPath)
    TypeWriter.LoadEntrypoint(Package.Id, "Main")
}