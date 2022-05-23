
--[[
	Hello there, reader of this file.
	i just want to note to you:
	i reworked the discordia logger from
	https://github.com/SinisterRectus/Discordia/blob/master/libs/utils/Logger.lua
	-- Thanks
]]

local date = os.date
local format = string.format
local stdout = _G.process.stdout.handle

local BLACK   = 30
local RED     = 31
local GREEN   = 32
local YELLOW  = 33
local BLUE    = 34
local MAGENTA = 35
local CYAN    = 36
local WHITE   = 37

local config = {
	{'[ERROR]  ', RED},
	{'[WARNING]', YELLOW},
	{'[INFO]   ', GREEN},
	{'[DEBUG]  ', CYAN},
}

local Logger = {}

do -- parse config
	local bold = 1
	for _, v in ipairs(config) do
		v[2] = format('\27[%i;%im%s\27[0m', bold, v[2], v[1])
	end
end


function Logger.Log(level, msg)

	local tag = config[level]
	if not tag then return end

	msg = msg or ""

	local d = date("%Y-%m-%d %H:%M:%S")
	print(format('[%s] %s: %s', d, tag[2], msg))

	return msg

end

local function ParsedLog(Level, Message, ...)
	if Message == nil then
		Message = ""
	end
	Message = tostring(Message)
	Message = string.format(Message, ...)
	for Index, Line in pairs(string.Split(Message, "\n")) do
		Logger.Log(Level, Line)
	end
end

function Logger.Error(Msg, ...)
	ParsedLog(1, Msg, ...)
end

function Logger.Warn(Msg, ...)
	ParsedLog(2, Msg, ...)
end

function Logger.Info(Msg, ...)
	ParsedLog(3, Msg, ...)
end

local DevMode = false
if _G.TypeWriter.Config then
	DevMode = _G.TypeWriter.Config.DevMode.Enabled
end
function Logger.Debug(Msg, ...)
	if DevMode == true then
		ParsedLog(4, Msg, ...)
	end
end

return Logger