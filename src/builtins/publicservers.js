import Builtin from "../structs/builtin";
import {DiscordModules, WebpackModules} from "modules";
import PublicServersMenu from "../ui/publicservers/menu";

const LayerStack = WebpackModules.getByProps("pushLayer");

export default new class PublicServers extends Builtin {
    get name() {return "PublicServers";}
    get category() {return "general";}
    get id() {return "publicServers";}

    enabled() {
        const wrapper = DiscordModules.GuildClasses.wrapper.split(" ")[0];
        const guilds = $(`.${wrapper} .scroller-2FKFPG >:first-child`);
        guilds.after(this.button);
    }

    disabled() {
        $("#bd-pub-li").remove();
    }

    openPublicServers() {
        LayerStack.pushLayer(() => DiscordModules.React.createElement(PublicServersMenu, {close: LayerStack.popLayer}));
    }

    get button() {
        const btn = $("<div/>", {
            "class": DiscordModules.GuildClasses.listItem,
            "id": "bd-pub-li"
        }).append($("<div/>", {
            "class": "wrapper-25eVIn " + DiscordModules.GuildClasses.circleButtonMask,
            "text": "public",
            "id": "bd-pub-button",
            "click": () => { this.openPublicServers(); }
        }));

        return btn;
    }
};