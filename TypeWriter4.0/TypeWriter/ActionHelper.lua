local ActionHelper = Class:extend()

function ActionHelper:initialize()
    self.Actions = {}
end

function ActionHelper:RegisterAction(Name, Function)
    self.Actions[String.lower(Name)] = Function
end

return ActionHelper