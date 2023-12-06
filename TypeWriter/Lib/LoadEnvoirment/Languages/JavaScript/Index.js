const RequireFromString = require("require-from-string")

module.exports = async function() {
    return {
        LoadFile: async function (FilePath) {
            const FileData = FS.readFileSync(FilePath, "utf8")
            return RequireFromString(FileData, Path.normalize(FilePath))
        },
        // LoadFileAsync: async function (FilePath) {
            // return this.LoadFile(FilePath)
        // },
    
        LoadString: async function (String, Name) {
            return RequireFromString(String, Name)
        }, 
        // LoadStringSync: function (String, Name) {
        //     return RequireFromString(String, Name)
        // },

        LoadStringWrapped: async function (String, Name) {
            const WrappedCodeData = `/* Wrapped by LoadStringWrapped (TypeWriter) */module.exports = (async function WrappedImport() { \n${String}\nreturn module.exports })`
            const WrappedImport = await TypeWriter.JavaScript.LoadString(WrappedCodeData, Name)
            return await WrappedImport()
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