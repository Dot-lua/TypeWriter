const KlawSync = require("klaw-sync")

module.exports = function FindDown(FolderPath, FileName) {
    const FileList = KlawSync(
        FolderPath,
        {
            nodir: true,
            preserveOwner: false
        }
    )
    const FoundFolder = Path.dirname(FileList.filter(
        function(File) {
            return Path.basename(File.path) == FileName
        }
    ).reduce(
        function(a, b) {
            return a.path.length <= b.path.length ? a : b;
        }
    ).path)
    return FoundFolder
}