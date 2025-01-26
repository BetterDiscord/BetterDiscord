import Builtin from "@structs/builtin";
import buildAddonCommand from "./addons";


export default new class DefaultCommands extends Builtin {
    get name() {return "DefaultCommands";}
    get category() {return "general";}
    get id() {return "defaultCommands";}

    enabled() {
        this.addCommands(
            buildAddonCommand("plugin"),
            buildAddonCommand("theme")
        );
    }

    disabled() {
        this.removeCommands();
    }
};