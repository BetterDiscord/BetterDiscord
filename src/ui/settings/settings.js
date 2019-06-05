import {SettingsInfo, Config, SettingsCookie/*, Plugins, Themes*/} from "data";
import {React/*, ReactDOM, Utilities, ContentManager, Events, PluginManager, ThemeManager*/} from "modules";
// import Sidebar from "./sidebar";
// import Scroller from "../scroller";
// import List from "../list";
// import ContentColumn from "./contentcolumn";
// import SectionedSettingsPanel from "./sectionedsettings";
// import Tools from "./exitbutton";
// import SettingsPanel from "./panel";
// import PluginCard from "./plugincard";
// import ThemeCard from "./themecard";
// import ReloadIcon from "../icons/reload";

// import CssEditor from "../customcss/editor";
// import SettingsGroup from "../settings/settingsgroup";
import SettingsGroup2 from "../settings/group";
import {Toasts} from "../ui";
import Settings from "../../data/settings/config";
import State from "../../data/settings/state";

export default class V2_SettingsPanel {

    constructor({onChange}) {
        this.onChange = onChange;
    }

    get coreSettings() {
        const settings = this.getSettings("core");
        const categories = [...new Set(settings.map(s => s.category))];
        const sections = categories.map(c => {return {title: c, settings: settings.filter(s => s.category == c)};});
        return sections;
    }

    get emoteSettings() {
        return this.getSettings("emote");
    }

    getSettings(category) {
        return Object.keys(SettingsInfo).reduce((arr, key) => {
            const setting = SettingsInfo[key];
            if (setting.cat === category && setting.implemented && !setting.hidden) {
                setting.text = key;
                arr.push(setting);
            }
            return arr;
        }, []);
    }

    

    getSettingsPanel(groups, onChange) {
        return groups.map(section => {
            return React.createElement(SettingsGroup2, Object.assign({}, section, {onChange}));
        });
    }

    get core3() {
        const groups = Settings;

        return groups.map((section, i) => {
            if (i == 0) section.button = {title: "Call to Action!", onClick: () => {Toasts.success("You did it!", {forceShow: true});}};
            // console.log(section);
            section.settings.forEach(item => item.value = State[section.id][item.id]);

            // if (section.settings.find(s => s.text == "Hide Channels")) section.settings.find(s => s.text == "Hide Channels").shouldHide = () => !SettingsCookie["bda-gs-2"];
            return React.createElement(SettingsGroup2, Object.assign({}, section, {onChange: this.onChange}));
        });
    }

    get core2() {
        return this.coreSettings.map((section, i) => {
            if (i == 0) section.button = {title: "Call to Action!", onClick: () => {Toasts.success("You did it!", {forceShow: true});}};
            // console.log(section);
            if (section.settings.find(s => s.text == "Hide Channels")) section.settings.find(s => s.text == "Hide Channels").shouldHide = () => !SettingsCookie["bda-gs-2"];
            return React.createElement(SettingsGroup2, Object.assign({}, section, {onChange: this.onChange, collapsible: true, collapsed: i > 1}));
        });
    }

    get attribution() {
        return React.createElement(
            "div",
            {style: {fontSize: "12px", fontWeight: "600", color: "#72767d", padding: "2px 10px"}},
            `BBD v${Config.bbdVersion} by `,
            React.createElement(
                "a",
                {href: "https://github.com/rauenzi/", target: "_blank"},
                "Zerebos"
            )
        );
    }

    // get coreComponent() {
    //     return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [
    //         React.createElement(SectionedSettingsPanel, {key: "cspanel", onChange: this.onChange, sections: this.coreSettings}),
    //         React.createElement(Tools, {key: "tools"})
    //     ]});
    // }

    // get emoteComponent() {
    //     return React.createElement(Scroller, {
    //         contentColumn: true, fade: true, dark: true, children: [
    //             React.createElement(SettingsPanel, {key: "espanel", title: "Emote Settings", onChange: this.onChange, settings: this.emoteSettings, button: {
    //                 title: "Clear Emote Cache",
    //                 onClick: () => { Events.dispatch("emotes-clear"); /*EmoteModule.clearEmoteData(); EmoteModule.init();*/ }
    //             }}),
    //             React.createElement(Tools, {key: "tools"})
    //     ]});
    // }

    // get customCssComponent() {
    //     return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [React.createElement(CssEditor, {key: "csseditor"}), React.createElement(Tools, {key: "tools"})]});
    // }

    // contentComponent(type) {
    //     const componentElement = type == "plugins" ? this.pluginsComponent : this.themesComponent;
    //     const prefix = type.replace("s", "");
    //     const settingsList = this;
    //     class ContentList extends React.Component {
    //         constructor(props) {
    //             super(props);
    //             this.onChange = this.onChange.bind(this);
    //         }

    //         componentDidMount() {
    //             Events.on(`${prefix}-reloaded`, this.onChange);
    //             Events.on(`${prefix}-loaded`, this.onChange);
    //             Events.on(`${prefix}-unloaded`, this.onChange);
    //         }

    //         componentWillUnmount() {
    //             Events.off(`${prefix}-reloaded`, this.onChange);
    //             Events.off(`${prefix}-loaded`, this.onChange);
    //             Events.off(`${prefix}-unloaded`, this.onChange);
    //         }

    //         onChange() {
    //             settingsList.sideBarOnClick(type);
    //         }

    //         render() {return componentElement;}
    //     }
    //     return React.createElement(ContentList);
    // }

    // get pluginsComponent() {
    //     const plugins = Object.keys(Plugins).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
    //         arr.push(React.createElement(PluginCard, {key: key, plugin: Plugins[key].plugin}));return arr;
    //     }, []);
    //     const list = React.createElement(List, {key: "plugin-list", className: "bda-slist", children: plugins});
    //     const refreshIcon = !SettingsCookie["fork-ps-5"] && React.createElement(ReloadIcon, {className: "bd-reload-header", size: "18px", onClick: async () => {
    //         PluginManager.updatePluginList();
    //         this.sideBarOnClick("plugins");
    //     }});
    //     const pfBtn = React.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.pluginsFolder); }}, "Open Plugin Folder");
    //     const contentColumn = React.createElement(ContentColumn, {key: "pcolumn", title: "Plugins", children: [refreshIcon, pfBtn, list]});
    //     return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, React.createElement(Tools, {key: "tools"})]});
    // }

    // get themesComponent() {
    //     const themes = Object.keys(Themes).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
    //         arr.push(React.createElement(ThemeCard, {key: key, theme: Themes[key]}));return arr;
    //     }, []);
    //     const list = React.createElement(List, {key: "theme-list", className: "bda-slist", children: themes});
    //     const refreshIcon = !SettingsCookie["fork-ps-5"] && React.createElement(ReloadIcon, {className: "bd-reload-header", size: "18px", onClick: async () => {
    //         ThemeManager.updateThemeList();
    //         this.sideBarOnClick("themes");
    //     }});
    //     const tfBtn = React.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.themesFolder); }}, "Open Theme Folder");
    //     const contentColumn = React.createElement(ContentColumn, {key: "tcolumn", title: "Themes", children: [refreshIcon, tfBtn, list]});
    //     return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, React.createElement(Tools, {key: "tools"})]});
    // }
}