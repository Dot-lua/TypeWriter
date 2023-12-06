const Colors = require("colors/safe")

function Pad(num, size) {
    var s = "00" + num;
    return s.substring(s.length-size);
}

class Logger {
    constructor(Name, LogLevel=3) {
        this.Name = Name
        this.LogLevel = LogLevel

        this.LogLevels = [
            Colors.underline(Colors.red("FATAL")),
            Colors.red("ERROR"),
            Colors.yellow("WARN "),
            Colors.brightGreen("INFO "),
            Colors.cyan("DEBUG")
        ]
    }

    Log(Level, Message) {
        if (Level > this.LogLevel) { return }

        const Time = new Date()
        const TimeString = `${Time.getFullYear()}-${Pad(Time.getMonth() + 1, 2)}-${Pad(Time.getDate(), 2)} ${Pad(Time.getHours(), 2)}:${Pad(Time.getMinutes(), 2)}:${Pad(Time.getSeconds(), 2)}`
        console.log(
            `[ ${Colors.bold(this.LogLevels[Level])} ] [ ${TimeString} ] [ ${this.Name} ] : ${Message}`
        )
    }

    Debug(Message) {
        this.Log(4, Message)
    }

    Info(Message) {
        this.Log(3, Message)
    }

    Information(Message) {
        this.Info(Message)
    }

    Warn(Message) {
        this.Log(2, Message)
    }

    Warning(Message) {
        this.Warn(Message)
    }

    Error(Message) {
        this.Log(1, Message)
    }

    Fatal(Message) {
        this.Log(0, Message)
    }
}

module.exports = Logger