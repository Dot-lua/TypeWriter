const FS = require("fs")

function Repeat(Snippet, Times) {
    var S = ""
    for (var i = 0; i < Times; i++) {
        S = S + Snippet
    }
    return S
}

function FindUp(Root, FileName, I=0) {
    const Path = `${Root}/${Repeat("/../", I)}/${FileName}`
    if (!FS.existsSync(Path)) {
        return FindUp(Root, FileName, I + 1)
    }
    return require("path").resolve(Path + "/../") + "/"
}

module.exports = FindUp