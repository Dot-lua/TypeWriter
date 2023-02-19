module.exports.RequireHelper = function(Module) {
    try {
        return require(Module)
    } catch {
        return
    }
}