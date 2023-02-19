local ArgumentParser = jsnew(
    require("argparse").ArgumentParser,
    "TypeWriter",
    nil,
    nil,
    "(C) 2021-2023 CoreByte"
)
p(ArgumentParser)
print(ArgumentParser)


ArgumentParser:add_argument("action", {"choices", {"Action to execute"}})
p(ArgumentParser:parse_args())