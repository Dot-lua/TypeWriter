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
        description: "action to execute",
        dest: "action"
    }
)

{ //Build Parser
    const BuildParser = SubParsers.add_parser(
        "build",
        {
            help: "build a twr archive"
        }
    )
    BuildParser.add_argument(
        "-i", "--input",
        {
            help: "input file",
            metavar: "path",
            default: "./src/"
        }
    )
    BuildParser.add_argument(
        "-b", "--branch",
        {
            help: "input branch",
            metavar: "branch",
            default: "Main"
        }
    )
    BuildParser.add_argument(
        "-o", "--output",
        {
            help: "output folder",
            metavar: "path",
            default: "./"
        }
    )
}
{ //Execute Parser
    const ExecuteParser = SubParsers.add_parser(
        "execute",
        {
            help: "execute a twr archive"
        }
    )
    ExecuteParser.add_argument(
        "-i", "--input",
        {
            help: "input file",
            metavar: "path",
            required: true
        }
    )
}
{ //New Parser
    const NewParser = SubParsers.add_parser(
        "new",
        {
            help: "create a new project in the current cwd"
        }
    )
}
{ //Run Parser
    const RunParser = SubParsers.add_parser(
        "run",
        {
            help: "run the src in the cwd"
        }
    )
    RunParser.add_argument(
        "-i", "--input",
        {
            help: "input file",
            metavar: "path",
            default: "./src/"
        }
    )
    RunParser.add_argument(
        "-b", "--branch",
        {
            help: "input branch",
            metavar: "branch",
            default: "Main"
        }
    )
}
{ //Runscript Parser
    const RunScriptParser = SubParsers.add_parser(
        "runscript",
        {
            help: "Runs a script"
        }
    )
    RunScriptParser.add_argument(
        "-i", "--input",
        {
            help: "input script",
            metavar: "path",
            default: "./index.js"
        }
    )
}

var Argv = process.argv.slice(2)
if (global.TypeWriterReplaceArguments) {
    Argv = global.TypeWriterReplaceArguments
}

const [KnownArguments, UnknownArguments] = MainParser.parse_known_args(Argv)
module.exports.Arguments = KnownArguments
module.exports.Unknown = UnknownArguments
module.exports.Parser = MainParser