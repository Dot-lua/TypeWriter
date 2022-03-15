
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
	stdout:write(format('[%s] %s: %s\n', d, tag[2], msg))

	return msg

end

function Logger.Error(Msg, ...)
	for I, v in pairs(String.Split(Msg or "", "\n")) do
		Logger.Log(1, v)
	end
end

function Logger.Warn(Msg, ...)
	for I, v in pairs(String.Split(Msg or "", "\n")) do
		Logger.Log(2, v)
	end
end

function Logger.Info(Msg, ...)
	for I, v in pairs(String.Split(Msg or "", "\n")) do
		Logger.Log(3, v)
	end
end

local DevMode = _G.TypeWriter.Config.DevMode.Enabled
function Logger.Debug(Msg, ...)
	if DevMode == true then
		for I, v in pairs(String.Split(Msg or "", "\n")) do
			Logger.Log(4, v)
		end
	end
end

return Logger