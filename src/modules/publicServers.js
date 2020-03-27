import {settingsCookie} from "../0globals";
import BDV2 from "./v2";
import webpackModules from "./webpackModules";
import Utils from "./utils";

import V2C_PublicServers from "../ui/publicServers";
import Layer from "../ui/layer";

export default new class V2_PublicServers {

    constructor() {
        this._appendButton = this._appendButton.bind(this);
    }

    get component() {
        return BDV2.react.createElement(Layer, {rootId: "pubslayerroot", id: "pubslayer", children: BDV2.react.createElement(V2C_PublicServers, {rootId: "pubslayerroot"})});
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
        // BdApi.alert("Broken", "Sorry but the Public Servers modules is currently broken, I recommend disabling this feature for now.");
        const root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layers");
            return;
        }
        BDV2.reactDom.render(this.component, root);
    }

    get button() {
        const btn = $("<div/>", {
            "class": BDV2.guildClasses.listItem,
            "id": "bd-pub-li",
            "style": settingsCookie["bda-gs-1"] ? "" : "display: none;"
        }).append($("<div/>", {
            "class": "wrapper-25eVIn " + BDV2.guildClasses.circleButtonMask,
            "text": "public",
            "id": "bd-pub-button",
            "click": () => { this.render(); }
        }));

        return btn;
    }

    _appendButton() {
        if ($("#bd-pub-li").length) return;
        const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
        const guilds = $(`.${wrapper} .scroller-2FKFPG >:first-child`);
        guilds.after(this.button);
    }

    addButton() {
        if (this.guildPatch) return;
        const GuildList = webpackModules.findByDisplayName("Guilds");
        this.guildPatch = Utils.monkeyPatch(GuildList.prototype, "render", {after: this._appendButton});
        this._appendButton();
    }

    removeButton() {
        this.guildPatch();
        delete this.guildPatch;
        $("#bd-pub-li").remove();
    }
};