class DependencyManager {
    constructor() {
        this.Managers = {
            NPM: new (require("./Managers/NPM.js")),
            // LIT: new (require("./Managers/LIT.js")),
        }
    }

    GetManager(Manager) {
        return this.Managers[Manager.toUpperCase()]
    }

    async GetLatestVersion(Depencency) {
        const Manager = this.GetManager(Depencency.Source)
        return await Manager.GetLatestVersion(Depencency)
    }

    async Exists(Depencency) {
        const Manager = this.GetManager(Depencency.Source)
        return await Manager.Exists(Depencency)
    }

    
}

module.exports = DependencyManager