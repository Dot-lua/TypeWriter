local FS = require("fs")
local Bundle = require("luvi").bundle

return function ()

    local function CreateFolder(Path, OutputPath)
        local Tree = require("path").resolve(OutputPath)
        for Index, Folder in pairs(string.Split(Path, "/")) do
            FS.mkdirSync(Tree .. "/" .. Folder)
            Tree = Tree .. "/" .. Folder
        end        
    end

    local OutputPath = TypeWriter.ArgumentParser:GetArgument("output", "o", "./")

    if FS.existsSync(OutputPath .. "/src/") then
        TypeWriter.Logger.Error(OutputPath .. "/src/ already exists")
        process:exit(1)
    end

    CreateFolder("src/Main/lua/ga/corebyte/template/", OutputPath)
    CreateFolder("src/Main/resources/", OutputPath)
    FS.writeFileSync(OutputPath .. "/src/Main/lua/ga/corebyte/template/Main.lua", "print(\"Hello World!\")")
    FS.writeFileSync(OutputPath .. "/src/Main/resources/package.info.lua", Bundle.readfile("/Actions/Init/package.info.lua"))
end