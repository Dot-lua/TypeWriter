local SessionManager = Object:extend()

local FS = require("fs")
local Uv = require("uv")

function SessionManager:initialize()
    
end

function SessionManager:GetRunningCount()
    local Data = FS.readFileSync(TypeWriter.Folder .. "/SessionStorage")
    local NumberData = tonumber(Data)
    if not NumberData then
        NumberData = 0
    end
    return NumberData
end

local function Increment(Amount, self)
    NumberData = self:GetRunningCount()
    NumberData = NumberData + Amount
    FS.writeFileSync(TypeWriter.Folder .. "/SessionStorage", NumberData)
end

local function Start(self)
    Increment(1, self)
end

local function Stop(self)
    Increment(-1, self)
end

local function HookCheck(self)
    local Signal = Uv.new_signal()
	Signal:start(Uv.constants.SIGINT, function()
		Signal:stop()
		Signal:close()
		return coroutine.wrap(Stop)(self)
	end)
end

function SessionManager:Hook()
    Start(self)
    local Signal = Uv.new_signal()
	Signal:start(Uv.constants.SIGINT, function()
		Signal:stop()
		Signal:close()
		return coroutine.wrap(Stop)(self)
	end)
    self.Signal = Signal
    return self
end

function SessionManager:Stop()
    self.Signal:close()
    Stop(self)
end

return SessionManager