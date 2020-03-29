import {bbdChangelog} from "../0globals";
import Utils from "./utils";
import BDV2 from "./v2";
import DOM from "./domtools";

import SideBar from "../ui/sidebar";
import History from "../ui/icons/history";
import TooltipWrap from "../ui/tooltipWrap";

export default class V2_SettingsPanel_Sidebar {

    constructor(onClick) {
        this.onClick = onClick;
    }

    get items() {
        return [{text: "Settings", id: "core"}, {text: "Emotes", id: "emotes"}, {text: "Plugins", id: "plugins"}, {text: "Themes", id: "themes"}, {text: "Custom CSS", id: "customcss"}];
    }

    get component() {
        //<TooltipWrap color="black" side="top" text={title}>
        
        const changelogButton = BDV2.react.createElement(TooltipWrap, {color: "black", side: "top", text: "Changelog"}, 
            BDV2.react.createElement("div", {className: "bd-changelog-button", onClick: () => {Utils.showChangelogModal(bbdChangelog);}},
                BDV2.react.createElement(History, {className: "bd-icon", size: "16px"})
            )
        );
        return BDV2.react.createElement("span", null, BDV2.react.createElement(SideBar, {onClick: this.onClick, headerText: "Bandaged BD", headerButton: changelogButton, items: this.items}));
    }

    get root() {
        const _root = DOM.query("#bd-settings-sidebar");
        if (!_root) {
            if (!this.injectRoot()) return null;
            return this.root;
        }
        return _root;
    }

    injectRoot() {
        const tabs = DOM.queryAll("[class*='side-'] > [class*='item-']:not([class*=Danger])");
        const changeLog = tabs[tabs.length - 1];
        if (!changeLog) return false;
        changeLog.parentElement.insertBefore(DOM.createElement(`<div id="bd-settings-sidebar">`), changeLog.previousElementSibling);
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