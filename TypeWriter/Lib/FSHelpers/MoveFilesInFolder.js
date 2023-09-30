const FS = require("fs-extra")

module.exports = function(From, To) {
    FS.readdirSync(From).forEach(
        File => {
            FS.moveSync(
                `${From}/${File}`,
                `${To}/${File}`
            )
        }
    )
}