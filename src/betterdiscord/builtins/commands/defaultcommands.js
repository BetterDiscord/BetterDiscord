import Builtin from "@structs/builtin";
import buildAddonCommand from "./addons";
import DebugCommand from "./debug";
import RestartCommand from "./restart";
import SupportCommand from "./support";
import CustomCSSCommand from "./customcss";
import SettingsCommand from "./settings";


export default new class DefaultCommands extends Builtin {
    get name() {return "DefaultCommands";}
    get category() {return "general";}
    get id() {return "defaultCommands";}

    initialize() {
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