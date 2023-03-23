const Fetch = require("sync-fetch")
const Cache = {}

function JsonRequest(Url) {
    if (Cache[Url]) {
        return Cache[Url]
    } else {
        const Response = Fetch(
            Url
        )
        var Data = false
        try {
            Data = Response.json()
        } catch {}
        Cache[Url] = {
            Data: Data,
            Response: Response
        }
        return Cache[Url]
    }
}

module.exports = JsonRequest