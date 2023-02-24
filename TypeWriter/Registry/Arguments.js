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

const SubParsers = MainParser.add_subparsers(
    {
        title: "action",
        description: "action to execute"
    }
)

const BuildParser = SubParsers.add_parser("build", {help: "build a twr archive"})
BuildParser.add_argument(
    "-i", "--input",
    {
        help: "input file"
    }
)

const Parsed = MainParser.parse_args()
console.log(Parsed)
module.exports = Parsed