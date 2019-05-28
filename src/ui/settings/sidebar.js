export default class V2_SettingsPanel_Sidebar {

    constructor(onClick) {
        this.onClick = onClick;
    }

    get items() {
        return [{text: "Core", id: "core"}, {text: "Bandages", id: "fork"}, {text: "Emotes", id: "emotes"}, {text: "Custom CSS", id: "customcss"}, {text: "Plugins", id: "plugins"}, {text: "Themes", id: "themes"}];
    }

    get component() {
        return BDV2.react.createElement(
            "span",
            null,
            BDV2.react.createElement(V2Components.SideBar, {onClick: this.onClick, headerText: "Bandaged BD", items: this.items}),
            BDV2.react.createElement(
                "div",
                {style: {fontSize: "12px", fontWeight: "600", color: "#72767d", padding: "2px 10px"}},
                `BD v${bdConfig.version} by `,
                BDV2.react.createElement(
                    "a",
                    {href: "https://github.com/Jiiks/", target: "_blank"},
                    "Jiiks"
                )
            ),
            BDV2.react.createElement(
                "div",
                {style: {fontSize: "12px", fontWeight: "600", color: "#72767d", padding: "2px 10px"}},
                `BBD v${bbdVersion} by `,
                BDV2.react.createElement(
                    "a",
                    {href: "https://github.com/rauenzi/", target: "_blank"},
                    "Zerebos"
                )
            )
        );
    }

    get root() {
        let _root = $("#bd-settings-sidebar");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root[0];
    }

    injectRoot() {
        let changeLog = $("[class*='side-'] > [class*='item-']:not([class*=Danger])").last();
        if (!changeLog.length) return false;
        $("<span/>", {id: "bd-settings-sidebar"}).insertBefore(changeLog.prev());
        return true;
    }

    render() {
        let root = this.root;
        if (!root) {
            console.log("FAILED TO LOCATE ROOT: [class*='side-'] > [class*='item-']:not([class*=Danger])");
            return;
        }
        BDV2.reactDom.render(this.component, root);
        Utils.onRemoved(root, () => {
            BDV2.reactDom.unmountComponentAtNode(root);
        });
    }
}