module.exports.Parse = function (DependencyString) {
    const Source = DependencyString.split("+")[0]
    var Author
    var Name
    if (DependencyString.split("+")[1].split("/").length == 2) {
        Author = DependencyString.split("+")[1].split("/")[0]
        Name = DependencyString.split("+")[1].split("/")[1].split("@")[0]
    } else {
        Name = DependencyString.split("+")[1].split("@")[0]
    }
    const Version = DependencyString.split("+")[1].split("@")[1]

    var FullName
    if (Author) {
        FullName = `${Author}/${Name}`
    } else {
        FullName = Name
    }

    var AtFullName = FullName
    if (Author) {
        AtFullName = `@${FullName}`
    }

    return {
        Source: Source,
        Author: Author,
        Name: Name.toLowerCase(),
        FullName: FullName,
        AtFullName: AtFullName,
        String: DependencyString,
        Version: Version
    }
}

module.exports.Format = function (DependencyObject) {
    var DependencyString = `${DependencyObject.Source}+`
    if (DependencyObject.Author) { DependencyString += `${DependencyObject.Author}/` }
    DependencyString += DependencyObject.Name
    if (DependencyObject.Version) { DependencyString += `@${DependencyObject.Version}` }

    return DependencyString
}