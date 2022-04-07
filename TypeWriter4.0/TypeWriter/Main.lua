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

    string.split = require("String/Split")
    string.Split = string.split

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
        Here = Path.resolve("./")
    }
    TypeWriter.Config = require("ConfigHelper"):new():ExportConfig()
    TypeWriter.Logger = require("Logger")
    TypeWriter.Args[0] = nil
    TypeWriter.Arguments = TypeWriter.Args
    TypeWriter.ArgumentParser = require("ArgumentParser"):new(args):Parse()

    if not require("fs").existsSync(TypeWriter.Folder .. "/SessionStorage") then
        TypeWriter.Logger.Error("Detected invalid installation")
        TypeWriter.Logger.Info("Installing TypeWriter...")
        require("./Installer/Main.lua")
        process:exit()
    end

    --Require helper
    _G.package.path = TypeWriter.Folder .. "/PackageCache/?/init.lua;" .. "./libs/?.lua;" .. _G.package.path

    require("fs").mkdirSync(TypeWriter.Folder .. "/PackageCache/")

    -- Run the actions
    local ActionHelper = require("ActionHelper"):new()
    ActionHelper:RegisterAction("Help", require("./Actions/Help/Help.lua"))
    ActionHelper:RegisterAction("Build", require("./Actions/Build/Build.lua"))
    ActionHelper:RegisterAction("ExecuteBuild", require("./Actions/ExecuteBuild/ExecuteBuild.lua"))
    ActionHelper:RegisterAction("Execute", require("./Actions/Execute/Execute.lua"))
    ActionHelper:RegisterAction("Init", require("./Actions/Init/Init.lua"))


    local Action = TypeWriter.ArgumentParser:GetRaw(1)
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

end)()
require("uv").run()