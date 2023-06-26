module.exports = async function (ExecuteFolder) {

    { // Global Vars
        TypeWriter.ExecuteFolder = ExecuteFolder
        TypeWriter.LoadedPackages = {}
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
        TypeWriter.LoadFile = RuntimeHelper.LoadFile
        TypeWriter.Import = RuntimeHelper.Import
        globalThis.Import = RuntimeHelper.Import
        TypeWriter.LoadEntrypoint = RuntimeHelper.LoadEntrypoint

        TypeWriter.PackageManager = require("../PackageManager")
        TypeWriter.ResourceManager = require("../ResourceManager")
    }

    { // Language globals

        const FS = require("fs-extra")
        const Path = require("path")
        const RequireFromString = require("require-from-string")
        const WasMoon = require("wasmoon")
        const LuaFactory = new WasMoon.LuaFactory()
        const LuaEnvoirment = await LuaFactory.createEngine(
            {
                enableProxy: true,
                injectObjects: true,
                openStandardLibs: true,
                traceAllocations: true,
            }
        )

        const OldWarn = console.warn
        console.warn = function (...Args) {
            if (Args[0] == "The type 'userdata' returned is not supported on JS") { return }
            OldWarn(...Args, "asd")
        }
        TypeWriter.Lua = {
            Envoirment: LuaEnvoirment,
            LoadFile: function (FilePath) {
                return LuaEnvoirment.doFileSync(FilePath)
            },
            LoadString: function (String, Name) {
                return LuaEnvoirment.doStringSync(String)
            },

            Global: LuaEnvoirment.doStringSync("return _G") // This throws 3 errors
        }
        console.warn = OldWarn
        TypeWriter.Lua.Envoirment.global.set("Sussy", "baka")

        TypeWriter.JavaScript = {
            LoadFile: function (FilePath) {
                const FileData = FS.readFileSync(FilePath, "utf8")
                return RequireFromString(FileData, Path.normalize(FilePath))
            },
            LoadString: function (String, Name) {
                return RequireFromString(String, Name)
            },

            Global: globalThis

        }
    }

    { // Load Require
        const RuntimeHelper = require("../RuntimeHelper.js")
        const { Module } = require("module")

        Module.prototype.require = RuntimeHelper.Require
        TypeWriter.JavaScript.Require = RuntimeHelper.Require
    }


}