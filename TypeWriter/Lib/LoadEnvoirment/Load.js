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
                traceAllocations: false
            }
        )
        LuaEnvoirment.global.registerTypeExtension(10, new (require("./LegacyClassFix.js")))

        TypeWriter.Lua = {
            Envoirment: LuaEnvoirment,
            LoadFile: function (FilePath) {
                const FileData = FS.readFileSync(FilePath, "utf8")
                return LuaEnvoirment.doStringSync(FileData)
            },
            LoadFileAsync: async function (FilePath) {
                const FileData = await FS.promises.readFile(FilePath, "utf8")
                return await LuaEnvoirment.doString(FileData)
            },

            LoadString: function (String, Name) {
                return LuaEnvoirment.doStringSync(String)
            },
            LoadStringAsync: async function (String, Name) {
                return await LuaEnvoirment.doString(String)
            }
        }
        TypeWriter.Lua.Envoirment.global.set("TypeWriter", TypeWriter)

        TypeWriter.JavaScript = {
            LoadFile: function (FilePath) {
                const FileData = FS.readFileSync(FilePath, "utf8")
                return RequireFromString(FileData, Path.normalize(FilePath))
            },
            LoadFileAsync: async function (FilePath) {
                return this.LoadFile(FilePath)
            },

            LoadString: function (String, Name) {
                return RequireFromString(String, Name)
            },
            LoadStringAsync: async function (String, Name) {
                return this.LoadString(String, Name)
            },

            //Operators
            New: function (Class, ...Args) {
                return new Class(...Args)
            },

            TypeOf: function (Object) {
                return typeof Object
            },

            InstanceOf: function (Object, Class) {
                return Object instanceof Class
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