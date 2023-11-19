const FetchJson = require("../../../Lib/FetchJson.js")
const FS = require("fs-extra")

class NPM {
    constructor() {

    }

    async GetLatestVersion(Dependency) {
        const [Response, Data] = await FetchJson(`https://cdn.jsdelivr.net/npm/${Dependency.AtFullName}/package.json`)
        return Data.version
    }

    async GetDependencyFolder(Depencency) {
        return `${TypeWriter.Folders.Cache.ModuleCache.NPM.ModulesFolder}/${Depencency.FullName}@${Depencency.Version}/`
    }

    async Exists(Depencency, Version) {
        if (Version) {
            const DependencyFolder = await this.GetDependencyFolder(Depencency)
            const FolderExists = FS.existsSync(DependencyFolder)
            if (!FolderExists) {
                const [Response] = await FetchJson(`https://cdn.jsdelivr.net/npm/${Depencency.AtFullName}/package.json`)
                const Exists = Response.status == 200
                return Exists
            }
            return true
        } else {

        }
    }
}

module.exports = NPM