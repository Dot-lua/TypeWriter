local Logger = require("Logger")

local Arguments = {
    h = "help",
    i = "info",
    r = "run",
    c = "compile",
    e = "execute",
    s = "setup"
}

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

local Prefixes = {
    Short = "-",
    Long = "--"
}

_G.RuntimeGlobal = {
    Arguments = Arguments,
    Executors = Executors,
    Prefixes = Prefixess
}

local Executor = nil
local Command = RuntimeArgs[1]

local Long = string.sub(Command, 1, #Prefixes.Long) == Prefixes.Long
local Short = false
if not Long then
    Short = string.sub(Command, 1, #Prefixes.Short) == Prefixes.Short
end

local SplitCommand

if Long then
    SplitCommand = string.sub(Command, #Prefixes.Long + 1)
elseif Short then
    SplitCommand = string.sub(Command, #Prefixes.Short + 1)
end


if Long then
    for i, v in pairs(Arguments) do
        if v == SplitCommand then
            Executor = Executors[v]
            break
        end
    end
elseif Short then
    for i, v in pairs(Arguments) do
        if i == SplitCommand then
            Executor = Executors[v]
            break
        end
    end
end

if Executor then
    Executor(RuntimeArgs)
else
    Logger.Error("Command " .. tostring(Command or SplitCommand) .. " Does not exist")
end