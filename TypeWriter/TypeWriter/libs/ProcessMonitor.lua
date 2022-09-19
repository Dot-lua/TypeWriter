local ProcessMonitor = Object:extend()

local Spawn = require("coro-spawn")
local Path = require("path")

local Getters = {
    ["win32"] = function ()
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
    end
}

function ProcessMonitor:initialize()
    
end

function ProcessMonitor:GetInstances()
    local Data = Getters[TypeWriter.OS]()
end

function ProcessMonitor:GetInstancesOf(File)
    self:GetInstances()
end

return ProcessMonitor