-- See https://github.com/Dot-lua/TypeWriter/wiki/package.info.lua-format for more info

return { InfoVersion = 1, -- Dont touch this

    ID = "template", -- A unique id 
    Name = "Template",
    Description = "A typewriter template",
    Version = "1.0.0",

    Author = {
        Developers = {
            "CoreByte"
        },
        Contributors = {}
    },

    Dependencies = {
        Luvit = {
            -- Luvit dependencies ("username/projectname")
        },
        Git = {},
        Dua = {}
    },

    Contact = {
        Website = "https://cubic-inc.ga",
        Source = "https://github.com/Dot-lua/TypeWriter/",
        Socials = {}
    },

    Entrypoints = {
        Main = "ga.corebyte.template.Main"
        -- CubyPackage = "some.other.entry.caused.by.another.package", -- a package can call another packages entrypoints
    }

}
