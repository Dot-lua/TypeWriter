const NodeFetch = require("node-fetch")

async function JsonRequest(Url) {
    const Response = await NodeFetch(Url)
    const Json = await Response.json()
    return [Response, Json]
}

module.exports = JsonRequest