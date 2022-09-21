local ProcessMonitor = Object:extend()

local Spawn = require("coro-spawn")
local Path = require("path")
local FS = require("fs")

local Getters = {
    [true] = function () -- windows
        local Result = Spawn(
            "cmd",
            {
                args = {
                    "/c",
                    "wmic process get ProcessId,ParentProcessId,CommandLine"
                }
            }
        )
        local Output = ""
        for Data in Result.stdout.read do
            Output = Output .. Data
        end
        Result.waitExit()

        local RunningCommands = {}
        for Index, SplitStage1 in pairs(Output.split(Output, "\r\n")) do
            local Command = table.concat(
                string.split(
                    SplitStage1,
                    " "
                ),
                " "
            )
            table.insert(RunningCommands, Command)
        end
        p(RunningCommands)
        require("fs").writeFileSync("./a.json", require("json").encode(RunningCommands, {indent = true}))
    end,
    [false] = function () --then it must be linux
        local Result = Spawn(
            "ps",
            {
                args = {
                    "lx"
                }
            }
        )
        local Output = ""
        for Data in Result.stdout.read do
            Output = Output .. Data
        end
        Result.waitExit()
        local Lines = Output:split("\n")
        local Processes = {}
        table.remove(Lines, 1)
        for Index, Line in pairs(Lines) do
            local SplitLine = Line:Split(" ")
            local Process = {}
            Process.PID = SplitLine[2]
            Process.PPID = SplitLine[3]
            for I = 1, 12 do
                table.remove(SplitLine, 1)
            end
            Process.CommandLine = table.concat(SplitLine, " ")
            local Command = SplitLine[1]
            Process.Command = Command
            table.remove(SplitLine, 1)
            Process.Arguments = SplitLine
            table.insert(Processes, Process)
        end
        p(Processes)
        require("fs").writeFileSync(
            require("json").encode(Processes, {indent = true})
        )
        return Processes
    end
}

function ProcessMonitor:initialize()
    
end

function ProcessMonitor:GetInstances()
    local Data = Getters[TypeWriter.OS == "win32"]()
    for Index, Process in pairs(Data) do
        p(Process.CommandLine)
    end
end

function ProcessMonitor:GetInstancesOf(File)
    self:GetInstances()
end

return ProcessMonitor