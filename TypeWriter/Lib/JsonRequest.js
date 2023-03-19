const Fetch = require("sync-fetch")
const Cache = {}

function JsonRequest(Url) {
    if (Cache[Url]) {
        return Cache[Url]
    } else {
        const Response = Fetch(
            Url
        )
        const Data = Response.json()
        Cache[Url] = Data
        return Data
    }
}

module.exports = JsonRequest