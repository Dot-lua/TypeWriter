return {
    name = "TypeWriter",
    version = "4.5.2",
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
        "creationix/coro-fs",
        "luvit/path",
        "luvit/json",
        "luvit/los",

        "creationix/coro-spawn",
        
        "creationix/base64",
        "luvit/querystring",

        "luvit/secure-socket",
        "creationix/coro-http",
        "creationix/semver",
    },
    files = {
        "**.lua",
        "!test*"
    }
}  
