local BuildHelper = Class:extend()

local FS = require("FS")
local Path = require("path")
local Json = require("json")

function BuildHelper:initialize(Folder, SubProject)
    self.SubProject = SubProject
    self.Folder = require("path").resolve(Folder) .. "/" .. SubProject .. "/"

    local Success, CompiledPackage = pcall(
        function ()
            local Data, Error = load(FS.readFileSync(self.Folder .. "/Resources/package.info.lua"))
            if Error then return error(Error) end
            return Data()
        end
    )

    if not Success then
        error("Error while compiling package info ('" .. self.Folder .. "/Resources/package.info.lua" .. "')\n" .. CompiledPackage)
    end

    self.Compiled = {
        BuildInfo = {
            TypeWriter = TypeWriter.Package,
            Date = os.date()
        },
        Package = CompiledPackage,
        Code = {},
        Resources = {}
    }

end

local MainNames = {
    ["main"] = true
}

local function FixPath(Name)
    return string.sub(Name, 2, -1)
end

function BuildHelper:Compile()
    local function BuildScan(self, Parent, Folder)
        TypeWriter.Logger.Debug("Compiling " .. Parent)
        TypeWriter.Logger.Debug("Compiling folder " .. Folder)
        for FileName, FileType in FS.scandirSync(Folder) do
            TypeWriter.Logger.Debug("Compiling working on " .. FileName)
            if FileType == "directory" then
                BuildScan(self, Parent .. "." .. FileName, Folder .. "/" .. FileName)
                if FS.existsSync(Folder .. "/" .. FileName .. "/Main.lua") then
                    self.Compiled.Code[FixPath(Parent .. "." .. FileName)] = {
                        Type = "Redirect",
                        RedirectTo = FixPath(Parent .. "." .. FileName .. ".Main")
                    }
                end
            elseif FileType == "file" then
                local FilePath = Folder .. "/" .. FileName
                if Path.extname(FilePath) == ".lua" then
                    self.Compiled.Code[FixPath(Parent .. "." .. Path.basename(FilePath, ".lua"))] = {
                        Type = "Code",
                        Code = FS.readFileSync(Folder .. "/" .. FileName)
                    }
                    if FS.existsSync(Folder .. "/" .. Path.basename(FileName, ".lua")) then
                        TypeWriter.Logger.Error("Found 2 duplicate file/folders in " .. FixPath(Parent))
                        TypeWriter.Logger.Error("Please fix before recompiling")
                        process:exit(1)
                    end
                else
                    TypeWriter.Logger.Error("Found a non .lua file (" .. FixPath(Parent .. "." .. FileName) .. ")")
                    TypeWriter.Logger.Error("Please fix before recompiling")
                    Process:exit(1)
                end
            end
        end
    end

    BuildScan(self, "", self.Folder .. "/lua/")

    return self
end


--@return table The compiled package
function BuildHelper:ExportRaw()
    return self.Compiled
end

--@param Indent bool
--@return string Compiled json
function BuildHelper:ExportJson(Indent)
    local Indent = Indent
    if Indent == nil then
        Indent = true
    end
    return Json.encode(
        self:ExportRaw(),
        {
            indent = Indent,
            keyorder = {
                "BuildInfo",
                "Package",
                "Code",
                "Resources"
            }
        }
    )
end

return BuildHelper