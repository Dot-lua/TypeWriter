const fetch = require('sync-fetch')

module.exports = function(Url) {
    const Data = fetch(Url)
    return Data.json()
}