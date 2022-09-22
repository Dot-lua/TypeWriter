local Uv = require("uv")

coroutine.wrap(function ()
    -- Globals

    _G.process = require('process').globalProcess()
    _G.class = require("core").Object
    _G.emitter = require("core").Emitter

    _G.Emitter = emitter
    _G.Class = class
    _G.object = class
    _G.Object = object

    _G.Require = require
    _G.Process = process

    _G.String = string
    _G.Table = table

    require("Extensions")()
    string.split = require("String/Split")
    string.Split = string.split
    string.random = require("String/Random")
    string.Random = string.random

    _G.sleep = require("timer").sleep
    _G.Sleep = sleep

    _G.Wait = function (Time)
        sleep(Time * 1000)
    end
    _G.wait = Wait

    if jit.os ~= 'Windows' then
        local sig = Uv.new_signal()
        Uv.signal_start(sig, 'sigpipe')
        Uv.unref(sig)
    end

    --Special Global
    local Package = require("./package")
    local Path = require("path")
    _G.TypeWriter = {
        Package = {
            Name = Package.name,
            Version = Package.version,
            Licence = Package.license
        },
        Args = args,
        Folder = Path.resolve(args[0], "../"),
        This = Path.resolve(args[0]),
        Here = Path.resolve("./"),
        Os = require("los").type(),
        OS = require("los").type(),
        Pid = process.pid
    }
    TypeWriter.Logger = require("Logger")
    TypeWriter.AppData = TypeWriter.Folder .. "/ApplicationData/"
    TypeWriter.ApplicationData = TypeWriter.AppData

    --#region Arg stuff
    TypeWriter.Args[0] = nil
    TypeWriter.Arguments = TypeWriter.Args
    TypeWriter.ArgumentParser = require("ArgumentParser"):new(args):Parse()

    local ActionOverride
    if TypeWriter.ArgumentParser:GetArgument("isexe", "isexe", "false") == "true" then
        TypeWriter.ExeName = TypeWriter.ArgumentParser:GetArgument("exename", "exename", "")
        TypeWriter.ExeFolder = Path.resolve(TypeWriter.ExeName, "../")
        local ExeArgs = require("json").decode(require("base64").decode(require("querystring").urldecode(TypeWriter.ArgumentParser:GetArgument("exearg", "exearg", ""))))

        ActionOverride = "executeexecutable"
        TypeWriter.Input = TypeWriter.ArgumentParser:GetArgument("input", "i", "")
        TypeWriter.Pid = tonumber(TypeWriter.ArgumentParser:GetArgument("exepid", "exepid", ""))

        TypeWriter.Args = ExeArgs
        TypeWriter.Arguments = TypeWriter.Args
        TypeWriter.ArgumentParser = require("ArgumentParser"):new(TypeWriter.Args):Parse()
    end
    --#endregion

    if not require("fs").existsSync(TypeWriter.Folder .. "/SessionStorage") then
        TypeWriter.Logger.Error("Detected invalid installation")
        TypeWriter.Logger.Info("Installing TypeWriter...")
        require("./Installer/Main.lua")
        process:exit()
    end
    TypeWriter.Config = require("ConfigHelper"):new():ExportConfig()
    TypeWriter.ProcessMonitor = require("ProcessMonitor"):new()

    --Require helper
    _G.package.path = TypeWriter.Folder .. "/PackageCache/?/init.lua;" .. "./libs/?.lua;" .. _G.package.path

    require("fs").mkdirSync(TypeWriter.Folder .. "/PackageCache/")
    require("fs").mkdirSync(TypeWriter.Folder .. "/Temp/")

    -- Run the actions
    local ActionHelper = require("ActionHelper"):new()
    ActionHelper:RegisterAction("BuildExecutable", require("./Actions/BuildExecutable/BuildExecutable.lua"))
    ActionHelper:RegisterAction("Build", require("./Actions/Build/Build.lua"))
    ActionHelper:RegisterAction("ClearCache", require("./Actions/ClearCache/ClearCache.lua"))
    ActionHelper:RegisterAction("Execute", require("./Actions/Execute/Execute.lua"))
    ActionHelper:RegisterAction("ExecuteBuild", require("./Actions/ExecuteBuild/ExecuteBuild.lua"))
    ActionHelper:RegisterAction("ExecuteExecutable", require("./Actions/ExecuteExecutable/ExecuteExecutable.lua"))
    ActionHelper:RegisterAction("Help", require("./Actions/Help/Help.lua"))
    ActionHelper:RegisterAction("Init", require("./Actions/Init/Init.lua"))


    local Action = ActionOverride or TypeWriter.ArgumentParser:GetRaw(1)
    local ActionResult = ActionHelper:ExecuteAction(Action or "")
    if ActionResult == true then
        
    elseif type(ActionResult) == "string" then
        TypeWriter.Logger.Error("The requested action did not finish")
        TypeWriter.Logger.Error(ActionResult)
    elseif ActionResult == false and Action == nil then
        ActionHelper:ExecuteAction("help")
    elseif ActionResult == false then
        TypeWriter.Logger.Error("The requested action (" .. Action .. ") does not exist")
        ActionHelper:ExecuteAction("help")
    end
    
    require("./Updater/Main.lua")()
    
end)()
Uv.run()
return _G.process.exitCode