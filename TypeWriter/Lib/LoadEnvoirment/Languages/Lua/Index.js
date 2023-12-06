const FS = require("fs-extra")

const WasMoon = require("wasmoon")


module.exports = async function() {
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
    LuaEnvoirment.global.set("TypeWriter", TypeWriter)

    return {
        Envoirment: LuaEnvoirment,
    
        LoadFile: async function (FilePath) {
            const FileData = await FS.promises.readFile(FilePath, "utf8")
            return await LuaEnvoirment.doString(FileData)
        },
        LoadFileSync: function (FilePath) {
            const FileData = FS.readFileSync(FilePath, "utf8")
            return LuaEnvoirment.doStringSync(FileData)
        },
    
        LoadString: async function (String, Name) {
            return await LuaEnvoirment.doString(String)
        },
        LoadStringSync: function (String, Name) {
            return LuaEnvoirment.doStringSync(String)
        }
    }
}