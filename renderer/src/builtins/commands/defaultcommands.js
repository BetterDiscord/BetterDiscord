import Builtin from "@structs/builtin";
import buildAddonCommand from "./addons";
import DebugCommand from "./debug";
import RestartCommand from "./restart";
import SupportCommand from "./support";


export default new class DefaultCommands extends Builtin {
    get name() {return "DefaultCommands";}
    get category() {return "general";}
    get id() {return "defaultCommands";}

    enabled() {
        this.addCommands(
            buildAddonCommand("plugin"),
            buildAddonCommand("theme"),
            DebugCommand,
            RestartCommand,
            SupportCommand
        );
    }

    disabled() {
        this.removeCommands();
    }
};