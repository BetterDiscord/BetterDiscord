import {Config} from "data";
import {React} from "modules";

import PluginCard from "./plugincard";
import ThemeCard from "./themecard";

import SettingsGroup from "../settings/group";
import SettingsTitle from "./title";

export default class V2_SettingsPanel {

    static buildSettingsPanel(title, config, state, onChange, button = null) {
        config.forEach(section => {
            section.settings.forEach(item => item.value = state[section.id][item.id]);
        });
        return this.getSettingsPanel(title, config, onChange, button);
    }

    static getSettingsPanel(title, groups, onChange, button = null) {
        return [React.createElement(SettingsTitle, {text: title, button: button}), groups.map(section => {
            return React.createElement(SettingsGroup, Object.assign({}, section, {onChange}));
        })];
    }

    static getPluginsPanel(plugins, folder) {
        const titleComponent = React.createElement(SettingsTitle, {text: "Plugins", button: {title: "Open Plugin Folder", onClick: () => { require("electron").shell.openItem(folder); }}});
        const cards = plugins.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())).map(plugin => 
            React.createElement(PluginCard, {key: plugin.id, content: plugin})
        );
        return [titleComponent, React.createElement("ul", {className: "bda-slist"}, ...cards)];
    }

    static getThemesPanel(themes, folder) {
        const titleComponent = React.createElement(SettingsTitle, {text: "Themes", button: {title: "Open Theme Folder", onClick: () => { require("electron").shell.openItem(folder); }}});
        const cards = themes.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())).map(theme => 
            React.createElement(ThemeCard, {key: theme.id, content: theme})
        );
        return [titleComponent, React.createElement("ul", {className: "bda-slist"}, ...cards)];
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
}