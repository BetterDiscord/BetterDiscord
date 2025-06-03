import Builtin from "@structs/builtin";
import buildAddonCommand from "./addons";
import DebugCommand from "./debug";
import RestartCommand from "./restart";
import SupportCommand from "./support";
import CustomCSSCommand from "./customcss";
import SettingsCommand from "./settings";


// TODO: convert all command builtins once command interface is created
// zerebos can do it if arven does not
export default new class DefaultCommands extends Builtin {
    get name() {return "DefaultCommands";}
    get category() {return "general";}
    get id() {return "defaultCommands";}

    async initialize() {
        this.addCommands(
            buildAddonCommand("plugin"),
            buildAddonCommand("theme"),
            DebugCommand,
            RestartCommand,
            SupportCommand,
            CustomCSSCommand,
            SettingsCommand
        );
    }
};