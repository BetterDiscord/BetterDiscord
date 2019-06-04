import Builtin from "../structs/builtin";
import {SettingsCookie} from "data";
import {BDV2, DiscordModules} from "modules";
import {PublicServers as PSComponents} from "ui";

export default new class PublicServers extends Builtin {
    get name() {return "PublicServers";}
    get category() {return "Modules";}
    get id() {return "bda-gs-1";}

    enabled() {
        const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
        const guilds = $(`.${wrapper} .scroller-2FKFPG >:first-child`);
        guilds.after(this.button);
    }

    disabled() {
        $("#bd-pub-li").remove();
    }

    get component() {
        return DiscordModules.React.createElement(PSComponents.Layer, {
            rootId: "pubslayerroot",
            id: "pubslayer"
        }, DiscordModules.React.createElement(PSComponents.Menu, {rootId: "pubslayerroot"}));
    }

    get root() {
        const _root = document.getElementById("pubslayerroot");
        if (!_root) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root;
    }

    injectRoot() {
        if (!$(".layers, .layers-3iHuyZ").length) return false;
        $(".layers, .layers-3iHuyZ").append($("<div/>", {
            id: "pubslayerroot"
        }));
        return true;
    }

    render() {
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layers");
            return;
        }
        DiscordModules.ReactDOM.render(this.component, root);
    }

    get button() {
        const btn = $("<div/>", {
            "class": BDV2.guildClasses.listItem,
            "id": "bd-pub-li"
        }).append($("<div/>", {
            "class": "wrapper-25eVIn " + BDV2.guildClasses.circleButtonMask,
            "text": "public",
            "id": "bd-pub-button",
            "click": () => { this.render(); }
        }));

        return btn;
    }
};