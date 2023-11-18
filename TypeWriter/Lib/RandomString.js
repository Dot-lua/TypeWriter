function RandomString(Length) {
    let String = ""
    while (String.length < Length) {
        String += Math.random().toString(36).substring(2)
    }
    return String.substring(0, Length)
}

module.exports = RandomString