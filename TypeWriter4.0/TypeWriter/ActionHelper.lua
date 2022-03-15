local ActionHelper = Class:extend()

function ActionHelper:initialize()
    self.Actions = {}
end

function ActionHelper:RegisterAction(Name, Function)
    self.Actions[String.lower(Name)] = Function
end

function ActionHelper:ExecuteAction(ActionName, ...)
    if self.Actions[string.lower(ActionName)] then
        return self.Actions[string.lower(ActionName)](...) or true
    else
        return false
    end
    
end

return ActionHelper