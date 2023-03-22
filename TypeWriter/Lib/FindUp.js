const FS = require("fs")

function Repeat(Snippet, Times) {
    var S = ""
    for (var i = 0; i < Times; i++) {
        S = S + Snippet
    }
    return S
}

function FindUp(Root, FileName, MaxUp, I=0) {
    if (I > MaxUp) {
        return null
    }

    const Path = `${Root}/${Repeat("/../", I)}/${FileName}`
    if (!FS.existsSync(Path)) {
        return FindUp(Root, FileName, MaxUp, I + 1)
    }
    return require("path").resolve(Path + "/../") + "/"
}

module.exports = FindUp