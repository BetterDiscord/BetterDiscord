import {Config} from "data";
import {React/*, ReactDOM, Utilities, ContentManager, Events, PluginManager, ThemeManager*/} from "modules";
// import Sidebar from "./sidebar";
// import Scroller from "../scroller";
// import List from "../list";
// import ContentColumn from "./contentcolumn";
// import SectionedSettingsPanel from "./sectionedsettings";
// import Tools from "./exitbutton";
// import SettingsPanel from "./panel";
import PluginCard from "./plugincard";
import ThemeCard from "./themecard";
// import ReloadIcon from "../icons/reload";

// import CssEditor from "../customcss/editor";
// import SettingsGroup from "../settings/settingsgroup";
import SettingsGroup from "../settings/group";
import SettingsTitle from "./title";

export default class V2_SettingsPanel {

    static buildSettingsPanel(title, config, state, onChange) {
        config.forEach(section => {
            section.settings.forEach(item => item.value = state[section.id][item.id]);
        });
        return this.getSettingsPanel(title, config, onChange);
    }

    static getSettingsPanel(title, groups, onChange) {
        return [React.createElement(SettingsTitle, {text: title}), groups.map(section => {
            return React.createElement(SettingsGroup, Object.assign({}, section, {onChange}));
        })];
    }

    static getPluginsPanel(plugins) {
        const titleComponent = React.createElement(SettingsTitle, {text: "Plugins", button: {title: "Open Plugin Folder", onClick: () => { require("electron").shell.openItem(""); }}});
        const cards = plugins.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())).map(plugin => 
            React.createElement(PluginCard, {key: plugin.id, content: plugin})
        );
        console.log(cards);
        return [titleComponent, React.createElement("ul", {className: "bda-slist"}, ...cards)];
        // const plugins = Object.keys(Plugins).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
        //     arr.push(React.createElement(PluginCard, {key: key, plugin: Plugins[key].plugin}));return arr;
        // }, []);
        // const list = React.createElement(List, {key: "plugin-list", className: "bda-slist", children: plugins});
        // const refreshIcon = !SettingsCookie["fork-ps-5"] && React.createElement(ReloadIcon, {className: "bd-reload-header", size: "18px", onClick: async () => {
        //     PluginManager.updatePluginList();
        //     this.sideBarOnClick("plugins");
        // }});
        // const pfBtn = React.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.pluginsFolder); }}, "Open Plugin Folder");
        // const contentColumn = React.createElement(ContentColumn, {key: "pcolumn", title: "Plugins", children: [refreshIcon, pfBtn, list]});
        // return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, React.createElement(Tools, {key: "tools"})]});
    }

    static getThemesPanel(themes) {
        const titleComponent = React.createElement(SettingsTitle, {text: "Themes", button: {title: "Open Theme Folder", onClick: () => { require("electron").shell.openItem(""); }}});
        const cards = themes.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())).map(theme => 
            React.createElement(ThemeCard, {key: theme.id, content: theme})
        );
        console.log(cards);
        return [titleComponent, React.createElement("ul", {className: "bda-slist"}, ...cards)];
        // const plugins = Object.keys(Plugins).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).reduce((arr, key) => {
        //     arr.push(React.createElement(PluginCard, {key: key, plugin: Plugins[key].plugin}));return arr;
        // }, []);
        // const list = React.createElement(List, {key: "plugin-list", className: "bda-slist", children: plugins});
        // const refreshIcon = !SettingsCookie["fork-ps-5"] && React.createElement(ReloadIcon, {className: "bd-reload-header", size: "18px", onClick: async () => {
        //     PluginManager.updatePluginList();
        //     this.sideBarOnClick("plugins");
        // }});
        // const pfBtn = React.createElement("button", {key: "folder-button", className: "bd-pfbtn", onClick: () => { require("electron").shell.openItem(ContentManager.pluginsFolder); }}, "Open Plugin Folder");
        // const contentColumn = React.createElement(ContentColumn, {key: "pcolumn", title: "Plugins", children: [refreshIcon, pfBtn, list]});
        // return React.createElement(Scroller, {contentColumn: true, fade: true, dark: true, children: [contentColumn, React.createElement(Tools, {key: "tools"})]});
    }

    static get attribution() {
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