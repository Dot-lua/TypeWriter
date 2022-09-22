local ProcessMonitor = Object:extend()

local Spawn = require("coro-spawn")
local Path = require("path")
local FS = require("fs")
local Json = require("json")

local Getters = {
    [true] = function () -- windows
        local Result = Spawn(
            "powershell",
            {
                args = {
                    "-Command",
                    "tasklist /FO csv | convertfrom-csv | convertto-json"
                }
            }
        )
        Result.waitExit()
        local Data = Json.decode(Result.stdout.read())
        local Processes = {}
        for Index, ProcessData in pairs(Data) do
            local Process = {}
            Process.Exe = ProcessData["Image Name"]
            Process.PID = ProcessData.PID
            table.insert(Processes, Process)
        end
        return Processes
    end,
    [false] = function () --then it must be linux
        local Result = Spawn(
            "ps",
            {
                args = {
                    "--no-headers", "-eco", "pid,command"
                }
            }
        )
        local Output = ""
        for Data in Result.stdout.read do
            Output = Output .. Data
        end
        Result.waitExit()
        local Lines = Output:Split("\n")
        local Processes = {}
        for Index, Line in pairs(Lines) do
            local Process = {}
            local SplitLine = Line:Split(" ")
            Process.PID = SplitLine[1]
            table.remove(SplitLine, 1)
            Process.Exe = table.concat(SplitLine, " ")
            table.insert(Processes, Process)
        end
        return Processes
    end
}

function ProcessMonitor:initialize()
    
end

function ProcessMonitor:GetInstances()
    local Data = Getters[TypeWriter.OS == "win32"]()
    return Data
end

function ProcessMonitor:GetInstancesOf(File)
    local All = self:GetInstances()
    local Count = 0
    for Index, Process in pairs(All) do
        if Process.Exe:lower():startswith("typewriter") == true then
            Count = Count + 1
        end
    end
    return Count
end

return ProcessMonitor