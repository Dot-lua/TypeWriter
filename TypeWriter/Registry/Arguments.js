const ArgParse = require("argparse")

const MainParser = new ArgParse.ArgumentParser(
    {
        prog: "TypeWriter",
        epilog: "(C) 2021-2023 CoreByte"
    }
)

MainParser.add_argument(
    "-v", "--version",
    {
        action: "version",
        version: require("../package.json").version
    }
)

const SubParsers = MainParser.add_subparsers({help: "action to execute"})

const BuildParser = SubParsers.add_parser("build")
BuildParser.add_argument(
    "-i", "--input",
    {
        help: "input file"
    }
)

console.log(MainParser.parse_args())