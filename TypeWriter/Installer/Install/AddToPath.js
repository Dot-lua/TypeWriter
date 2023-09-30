const FS = require("fs-extra")

function RemoveLineFromFile(FilePath, RmLine) {
    if (FS.existsSync(FilePath) == false) {
        return
    }
    const FileData = FS.readFileSync(FilePath, "utf-8")
    const SplitLines = FileData.split("\n")
    for (const LineNr in SplitLines) {
        const Line = SplitLines[LineNr]
        if (Line == RmLine) {
            delete SplitLines[LineNr]
        }
    }
    if (SplitLines.filter(function (S) { return S != "" }).length == 0) {
        FS.writeFileSync(FilePath, "", "utf-8")
        return
    }
    FS.writeFileSync(FilePath, SplitLines.join("\n"), "utf-8")
}

function AddLineToFile(FilePath, AddLine) {
    if (FS.existsSync(FilePath) == false) {
        FS.writeFileSync(FilePath, "", "utf-8")
    }
    const FileData = FS.readFileSync(FilePath, "utf-8")
    const SplitLines = FileData.split("\n")
    var LineFound = false

    for (const LineNr in SplitLines) {
        const Line = SplitLines[LineNr]
        if (Line == AddLine) {
            LineFound = true
            break
        }
    }

    if (LineFound == false) {
        SplitLines.push(AddLine)
    }
    FS.writeFileSync(FilePath, SplitLines.join("\n"), "utf-8")
}

module.exports = async function (InstallLocation) {
    if (TypeWriter.OS != "win32") {
        RemoveLineFromFile(`${process.env.HOME}/.bash_profiles`, `alias TypeWriter="'${process.env.HOME}/Library/Application Support/TypeWriter//TypeWriter'"`)
        RemoveLineFromFile(`${process.env.HOME}/.bash_profiles`, `alias TypeWriter="'${InstallLocation}/TypeWriter'"`)

        RemoveLineFromFile(`${process.env.HOME}/.zshenv`, `. ~/.bash_profiles`)

        AddLineToFile(`${process.env.HOME}/.bash_profiles`, `alias TypeWriter="'${InstallLocation}/TypeWriter'" #This line was added by TypeWriter v6 https://github.com/Dot-lua/TypeWriter/`)
        AddLineToFile(`${process.env.HOME}/.bash_profiles`, `alias typewriter="'${InstallLocation}/TypeWriter'" #This line was added by TypeWriter v6 https://github.com/Dot-lua/TypeWriter/`)
        AddLineToFile(`${process.env.HOME}/.zshenv`, `alias TypeWriter="'${InstallLocation}/TypeWriter'" #This line was added by TypeWriter v6 https://github.com/Dot-lua/TypeWriter/`)
        AddLineToFile(`${process.env.HOME}/.zshenv`, `alias typewriter="'${InstallLocation}/TypeWriter'" #This line was added by TypeWriter v6 https://github.com/Dot-lua/TypeWriter/`)
    } else {
        FS.writeFileSync(
            `${process.env.LOCALAPPDATA}/Microsoft/WindowsApps/TypeWriter.bat`,
            `@echo off\n${process.env.APPDATA}/.TypeWriter/TypeWriter.exe %*`
        )
    }
}