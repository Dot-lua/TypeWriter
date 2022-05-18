local FS = require("fs")
local CompileHelper = require("BuildHelper")
local Bundle = require("luvi").bundle
local Spawn = require("coro-spawn")

local function ExtractFolder(From, To)
    local Dir = Bundle.readdir(From)
    for Index, FileName in pairs(Dir) do
        local File = From .. "/" .. FileName
        if Bundle.stat(File).type == "directory" then
            FS.mkdirSync(To .. "/" .. FileName)
            ExtractFolder(File, To .. "/" .. FileName)
        else
            local Data = Bundle.readfile(File)
            FS.writeFileSync(To .. "/" .. FileName, Data)
        end
    end
end

return function ()
    local JobLocation = TypeWriter.Folder .. "/Temp/" .. string.Random(10)
    FS.mkdirSync(JobLocation)

    TypeWriter.Logger.Info("Loading compiler")
    local Compiler = CompileHelper:new(TypeWriter.ArgumentParser:GetArgument("input", "i", "./src/"), TypeWriter.ArgumentParser:GetArgument("branch", "b", "Main"))
    TypeWriter.Logger.Info("Compiling")
    Compiler:Compile()

    TypeWriter.Logger.Info("Compiled!")
    TypeWriter.Logger.Info("Writing compiled package")

    FS.writeFileSync(JobLocation .. "/Pkg.twr", Compiler:ExportJson(true))
    TypeWriter.Logger.Info("Wrote compiled package")

    ExtractFolder("/Assets/ExecutableProject/", JobLocation)

    local OutputLocation = TypeWriter.ArgumentParser:GetArgument("output", "o", "./")
    FS.mkdirSync(OutputLocation .. "/TypeWriter/")
    FS.mkdirSync(OutputLocation .. "/TypeWriter/Build/")

    local ExeLocation = OutputLocation .. "/TypeWriter/Build/" .. Compiler.Compiled.Package.ID .. ({["win32"] = ".exe"})[TypeWriter.Os] or ""

    if FS.existsSync(ExeLocation) then
        FS.unlinkSync(ExeLocation)
    end

    local Result, Error = Spawn(
        TypeWriter.Folder .. "/Binary/luvi",
        {
            args = {
                JobLocation,
                "-o", ExeLocation
            }
        }
    )
    Result.waitExit()
    print(Error)
    print(Result.stderr.read())
    print(Result.stdout.read())
end