local ActionHelper = Class:extend()

function ActionHelper:initialize()
    self.Actions = {}
end

function ActionHelper:RegisterAction(Name, Function)
    self.Actions[String.lower(Name)] = Function
end

function ActionHelper:ExecuteAction(ActionName, ...)
    if self.Actions[string.lower(ActionName)] then
        local Success = self.Actions[string.lower(ActionName)](...)
        if Success == nil then
            Success = true
        end
        return Success
    else
        return false
    end
    
end

return ActionHelper