return function(PackageName)
    local InternalPackages = {

    }

    return LoadPackage(InternalPackages[PackageName])
end