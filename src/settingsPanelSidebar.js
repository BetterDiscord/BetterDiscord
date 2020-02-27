import Utils from "./utils";
import BDV2 from "./v2";

import SideBar from "./react/sidebar";

export default class V2_SettingsPanel_Sidebar {

    constructor(onClick) {
        this.onClick = onClick;
    }

    get items() {
        return [{text: "Settings", id: "core"}, {text: "Emotes", id: "emotes"}, {text: "Plugins", id: "plugins"}, {text: "Themes", id: "themes"}, {text: "Custom CSS", id: "customcss"}];
    }

    get component() {
        return BDV2.react.createElement("span", null, BDV2.react.createElement(SideBar, {onClick: this.onClick, headerText: "Bandaged BD", items: this.items}));
    }

    get root() {
        const _root = $("#bd-settings-sidebar");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root[0];
    }

    injectRoot() {
        const changeLog = $("[class*='side-'] > [class*='item-']:not([class*=Danger])").last();
        if (!changeLog.length) return false;
        $("<span/>", {id: "bd-settings-sidebar"}).insertBefore(changeLog.prev());
        return true;
    }

    render() {
        const root = this.root;
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