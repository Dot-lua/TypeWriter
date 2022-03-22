return {
    name = "TypeWriter",
    version = "4.0.0",
    description = "Lua package creator",
    tags = {
        "Package"
    },
    license = "MIT",
    author = {
        name = "CoreByte"
    },
    homepage = "typewriter.corebyte.ga",
    dependencies = {
        "luvit/process",
        "luvit/require",
        "luvit/core",
        "luvit/pretty-print",
        "luvit/fs",
        "luvit/path",
        "luvit/json"
    },
    files = {
        "**.lua",
        "!test*"
    }
}  