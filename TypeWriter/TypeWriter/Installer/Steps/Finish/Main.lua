return function (InstallCache)
    local FS = InstallCache.FS 
    local InstallLocation = InstallCache.Location
    
    local Finish = {
        [true] = function ()
            
            FS.writeFileSync(
                _G.process.env.LOCALAPPDATA .. "/Microsoft/WindowsApps/TypeWriter.bat",
                "@echo off\n" .. _G.process.env.APPDATA .. "/.TypeWriter/TypeWriter.exe %*"
            )
    
        end,
        [false] = function ()
            os.execute("chmod +x '" .. InstallLocation .. "/TypeWriter'")
    
            local ProfileLocation = process.env.HOME .. "/.bash_profiles"
    
            local function FindAndInsert(FileLocation, InsertLine)
    
                if not FS.existsSync(FileLocation) then
                    FS.writeFileSync(FileLocation, "")
                end
    
                local Profile = FS.readFileSync(FileLocation)
    
                local Found = false
                for Index, Line in pairs(String.Split(Profile, "\n")) do
                    if Line == InsertLine then
                        Found = true 
                        break
                    end
                end
    
                FS.writeFileSync(
                    FileLocation,
                    Profile .. "\n\n" .. InsertLine
                )
    
                return not Found
            end
    
    
            if FindAndInsert(ProfileLocation, 'alias TypeWriter="\'' .. InstallLocation .. '/TypeWriter\'"') then
                TypeWriter.Logger.Info("Added TypeWriter to your bash profile")
            end
    
            if FindAndInsert(process.env.HOME .. "/.zshenv", ". ~/.bash_profiles") then 
                TypeWriter.Logger.Info("Added bash profile to your zshrc")
            end
            
        end
    }

    TypeWriter.Logger.Info("Finishing installation")
    Finish[TypeWriter.Os == "win32"]()
    FS.mkdirSync(InstallCache.Location .. "/ApplicationData/")

    local Result, Error = require("coro-spawn")(
        InstallCache.Location .. "/TypeWriter",
        {
            cwd = InstallCache.Location
        }
    )
    if Error then
        p(Error)
    end
    Result.waitExit()
end