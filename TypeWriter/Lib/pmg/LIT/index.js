function DownloadPackage(PackageName, PackageVersion) {

}

function LoadPackage(PackageName, PackageVersion, ExecuteDirectory) {

}

function GetLatestPackageVersion(PackageName) {

}

function PackageExists(PackageName) {
    return true
}

module.exports = {
    DownloadPackage: DownloadPackage,
    LoadPackage: LoadPackage,
    GetLatestPackageVersion: GetLatestPackageVersion,
    PackageExists: PackageExists
}