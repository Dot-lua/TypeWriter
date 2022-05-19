return {
    name = "TypeWriterExecutable",
    version = "1.0.0",
    description = "A TypeWriter executable",
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