const Logger = {}

const Colors = require("colors")
const LogLevel = Number(process.env.TYPEWRITER_LOGLEVEL) || 2
console.log(LogLevel)
const Levels = [
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

function Pad(num, size) {
    var s = "00" + num;
    return s.substring(s.length-size);
}

Logger.Log = function(Level, Message) {
    if (Level > LogLevel) {return}

    const LevelInfo = Levels[Level]
    const Time = new Date()
    console.log(
        `[${Time.getFullYear()}-${Pad(Time.getMonth() + 1, 2)}-${Pad(Time.getDate(), 2)} ${Pad(Time.getHours(), 2)}:${Pad(Time.getMinutes(), 2)}:${Pad(Time.getSeconds(), 2)}] ${Colors[LevelInfo.Color](LevelInfo.Label).bold}: ${Message}`
    )
}

Logger.Debug = function(Message) {
    this.Log(3, Message)
}


Logger.Info = function(Message) {
    this.Log(2, Message)
}

Logger.Information = function(Message) {
    this.Info(Message)
}


Logger.Warn = function(Message) {
    this.Log(1, Message)
}

Logger.Warning = function(Message) {
    this.Warn(Message)
}


Logger.Error = function(Message) {
    this.Log(0, Message)
}

module.exports = Logger