import Builtin from "../structs/builtin";
import {BDV2, DiscordModules, WebpackModules} from "modules";
import {PublicServersMenu} from "ui";

const LayerStack = WebpackModules.getByProps("pushLayer");

export default new class PublicServers extends Builtin {
    get name() {return "PublicServers";}
    get category() {return "general";}
    get id() {return "publicServers";}

    enabled() {
        const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
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
            "class": BDV2.guildClasses.listItem,
            "id": "bd-pub-li"
        }).append($("<div/>", {
            "class": "wrapper-25eVIn " + BDV2.guildClasses.circleButtonMask,
            "text": "public",
            "id": "bd-pub-button",
            "click": () => { this.openPublicServers(); }
        }));

        return btn;
    }
};