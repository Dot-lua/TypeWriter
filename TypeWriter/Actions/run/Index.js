const RandomString = require("randomstring")
const FS = require("fs-extra")
const Path = require("path")

const BuildHelper = require("../../Lib/BuildHelper.js")
const LoadEnvoirment = require("../../Lib/LoadEnvoirment")

module.exports.Name = "Run"
module.exports.Execute = async function() {
    const InputPath = TypeWriter.Arguments.input
    const InputBranch = TypeWriter.Arguments.branch

    const BuildId = BuildHelper.Build(InputPath, InputBranch)
    const ExecuteId = RandomString.generate(32)
    TypeWriter.Logger.Debug(`ExecuteId is ${ExecuteId}`)
    const ExecuteFolder = Path.normalize(`${TypeWriter.Folder}/Cache/ExecuteCache/${ExecuteId}/`)
    TypeWriter.Logger.Debug(`ExecuteFolder is ${ExecuteFolder}`)
    
    FS.mkdirSync(ExecuteFolder)

    BuildHelper.CompressBuild(BuildId, ExecuteFolder)
    BuildHelper.CleanupBuild(BuildId)
    if (BuildId == false) {
        return
    }

    await LoadEnvoirment(ExecuteFolder)
    const Package = TypeWriter.LoadFile(`${ExecuteFolder}/${FS.readdirSync(ExecuteFolder)}`)
    TypeWriter.LoadEntrypointAsync(Package.Id, "Main")
}