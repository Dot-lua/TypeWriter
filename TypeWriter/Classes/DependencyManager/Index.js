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

    async GetDependencyFolder(Depencency, Version) {
        const Manager = this.GetManager(Depencency.Source)
        return await Manager.GetDependencyFolder(Depencency, Version)
    }

    async Exists(Depencency) {
        const Manager = this.GetManager(Depencency.Source)
        return await Manager.Exists(Depencency)
    }

    async AddDependencyToQueue(Depencency) {
        const Manager = this.GetManager(Depencency.Source)
        return await Manager.AddDependencyToQueue(Depencency)
    }

    async ExecuteQueue() {
        const Promises = []
        for (const ManagerName in this.Managers) {
            const Manager = this.Managers[ManagerName]
            Promises.push(Manager.ExecuteQueue())
        }
        return await Promise.all(Promises)
    }

    
}

module.exports = DependencyManager