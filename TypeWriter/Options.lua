local Logger = require("Logger")
local FS = require("FS")
local Json = require("Json")

local Executors = {
    help = require("./Actions/Help/Init.lua"),
    info = Info,
    run = require("./Actions/Run/Init.lua"),
    compile = require("./Actions/Compile/Init.lua"),
    execute = require("./Actions/Execute/Init.lua"),
    setup = require("./Actions/Setup/Init.lua")
}

local ArgumentInfo = {
    help = "Get Some Help",
    info = "Get version info",
    run = "Run a Dua file",
    compile = "Compile a folder",
    execute = "Compile and run a folder",
    setup = "Setup a development envoirment"
}

local CommandName = string.lower(RuntimeArgs[1])
local Command = Executors[CommandName]

local Metrics = Json.decode(FS.readFileSync(RuntimePath .. "/Config/Metrics.json"))

Metrics.TotalRuns = Metrics.TotalRuns + 1

if Command ~= nil then
    Metrics.CompleteRuns = Metrics.CompleteRuns + 1
    Metrics.Commands[CommandName] = (Metrics.Commands[CommandName] or 0) + 1
else
    Metrics.FailedRuns = Metrics.FailedRuns + 1
end

FS.writeFileSync(RuntimePath .. "/Config/Metrics.json", Json.encode(Metrics, {indent = true}))

if not Command then
    Logger.Error("The given command does not exist!")
    Logger.Error("For Help run 'TypeWriter help'")
else
    Command(RuntimeArgs)
end