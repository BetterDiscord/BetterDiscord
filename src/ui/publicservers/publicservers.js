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
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: .layers");
            return;
        }
        BDV2.reactDom.render(this.component, root);
    }

    get button() {
        let btn = $("<div/>", {
            "class": BDV2.guildClasses.guild,
            "id": "bd-pub-li",
            "css": {
                height: "20px",
                display: settingsCookie["bda-gs-1"] ? "" : "none"
            }
        }).append($("<div/>", {
            "class": BDV2.guildClasses.guildInner,
            "css": {
                "height": "20px",
                "border-radius": "4px"
            }
        }).append($("<a/>", {

        }).append($("<div/>", {
            text: "public",
            id: "bd-pub-button",
            css: {
                "line-height": "20px",
                "font-size": "12px"
            },
            click: () => { this.render(); }
        }))));

        return btn;
    }

    initialize() {
        let guilds = $(`.${BDV2.guildClasses.guilds.split(" ")[0]}>:first-child`);
        guilds.after(this.button);
    }
}