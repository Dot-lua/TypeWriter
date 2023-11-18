const Colors = require("colors/safe")

function Pad(num, size) {
    var s = "00" + num;
    return s.substring(s.length-size);
}

class Logger {
    constructor(Name, LogLevel) {
        this.Name = Name
        this.LogLevel = LogLevel

        this.LogLevels = [
            {
                Label: "[ERROR]      ",
                Color: "red"
            },
            {
                Label: "[WARNING]    ",
                Color: "yellow"
            },
            {
                Label: "[INFORMATION]",
                Color: "brightGreen"
            },
            {
                Label: "[DEBUG]      ",
                Color: "cyan"
            }
        ]
    }

    Log(Level, Message) {
        if (Level > this.LogLevel) { return }

        const LevelInfo = this.LogLevels[Level]
        const Time = new Date()
        const TimeString = `[${Time.getFullYear()}-${Pad(Time.getMonth() + 1, 2)}-${Pad(Time.getDate(), 2)} ${Pad(Time.getHours(), 2)}:${Pad(Time.getMinutes(), 2)}:${Pad(Time.getSeconds(), 2)}]`
        console.log(
            `${TimeString} ${Colors.bold(Colors[LevelInfo.Color](LevelInfo.Label))}: ${Message}`
        )
    }

    Debug(Message) {
        this.Log(3, Message)
    }

    Info(Message) {
        this.Log(2, Message)
    }

    Information(Message) {
        this.Info(Message)
    }

    Warn(Message) {
        this.Log(1, Message)
    }

    Warning(Message) {
        this.Warn(Message)
    }

    Error(Message) {
        this.Log(0, Message)
    }
}

module.exports = Logger