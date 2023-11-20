module.exports = async function (ExecuteFolder) {

    { // Global Vars
        TypeWriter.ExecuteFolder = ExecuteFolder

        Error.stackTraceLimit = Infinity
    }

    { // Sleeping
        globalThis.SleepSync = async function (Time) {
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Time)
        }

        globalThis.WaitSync = async function (Time) { //in seconds
            Sleep(Time * 1000)
        }

        globalThis.Sleep = function (Time) {
            return new Promise((resolve) => setTimeout(resolve, Time))
        }

        globalThis.Wait = function (Time) { //in seconds
            return Sleep(Time * 1000)
        }
    }

    { // Runtime functions
        const RuntimeHelper = require("../RuntimeHelper.js")
        TypeWriter.GetPackagePath = RuntimeHelper.GetPackagePath

        TypeWriter.LoadFile = RuntimeHelper.LoadFile

        TypeWriter.Import = RuntimeHelper.Import
        globalThis.Import = RuntimeHelper.Import
        TypeWriter.ImportAsync = RuntimeHelper.ImportAsync
        globalThis.ImportAsync = RuntimeHelper.ImportAsync

        TypeWriter.LoadEntrypoint = RuntimeHelper.LoadEntrypoint
        TypeWriter.LoadEntrypointAsync = RuntimeHelper.LoadEntrypointAsync
    }

    { // Language globals
        await require("./Languages/Index.js")(TypeWriter)
    }

    { // Load Require
        const RuntimeHelper = require("../RuntimeHelper.js")
        const { Module } = require("module")

        Module.prototype.require = RuntimeHelper.Require
        TypeWriter.JavaScript.Require = RuntimeHelper.Require
    }


}