

module.exports = {
    Managers: {
        NPM: new (require("./Managers/NPM.js")),
        LIT: new (require("./Managers/LIT.js")),
    },

    DependencyFormatter: require("./DependencyFormatter.js"),
    TryParse: function (Dependency) {
        if (typeof Dependency == "object") {
            return Dependency
        } else {
            return this.DependencyFormatter.ParseDependency(Dependency)
        }
    },

    GetManager: function (Manager) {
        if (this.Managers[Manager.toLowerCase()]) {
            return this.Managers[Manager.toLowerCase()]
        } else if (this.Managers[Manager.toUpperCase()]) {
            return this.Managers[Manager.toUpperCase()]
        } else {
            return null
        }
    },

    PackageExists: function (Dependency) {
        Dependency = this.TryParse(Dependency)
        const Manager = this.GetManager(Dependency.Source)
        return Manager.PackageExists(Dependency)
    },

    LatestPackageVersion: function (Dependency) {
        Dependency = this.TryParse(Dependency)
        const Manager = this.GetManager(Dependency.Source)
        return Manager.LatestPackageVersion(Dependency)
    },

    PackageFolder: function (Dependency) {
        Dependency = this.TryParse(Dependency)
        const Manager = this.GetManager(Dependency.Source)
        return Manager.PackageFolder(Dependency)
    },

    LoadPackage: function (Dependency, ExecuteDirectory) {
        Dependency = this.TryParse(Dependency)
        const Manager = this.GetManager(Dependency.Source)
        return Manager.LoadPackage(Dependency, ExecuteDirectory)
    },

    HasVersion: function (Dependency) {
        Dependency = this.TryParse(Dependency)
        return Dependency.Version != undefined || Dependency.Version != null
    }
}