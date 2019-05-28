export default class V2_PublicServers {

    constructor() {}

    get component() {
        return BDV2.react.createElement(V2Components.Layer, {rootId: "pubslayerroot", id: "pubslayer", children: BDV2.react.createElement(V2C_PublicServers, {rootId: "pubslayerroot"})});
    }

    get root() {
        let _root = document.getElementById("pubslayerroot");
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
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layers");
            return;
        }
        BDV2.reactDom.render(this.component, root);
    }

    get button() {
        let btn = $("<div/>", {
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

    initialize() {
        const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
        const guilds = $(`.${wrapper} .scroller-2FKFPG >:first-child`);
        guilds.after(this.button);
    }
}