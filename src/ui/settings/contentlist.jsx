// static getPluginsPanel(plugins, state, options = {}) {
//     const {folder = "", onChange, reload} = options;
//     const titleComponent = React.createElement(SettingsTitle, {text: "Plugins", button: {title: "Open Plugin Folder", onClick: () => { require("electron").shell.openItem(folder); }}});
//     const cards = plugins.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())).map(plugin =>
//         React.createElement(PluginCard, {key: plugin.id, enabled: state[plugin.id], content: plugin, onChange, reload})
//     );
//     return [titleComponent, React.createElement("ul", {className: "bda-slist"}, ...cards)];
// }

import {React, Settings} from "modules";

import SettingsTitle from "./title";
import PluginCard from "./plugincard";
import ThemeCard from "./themecard";
import ReloadIcon from "../icons/reload";

export default class ContentList extends React.Component {

    reload() {
        if (this.props.refreshList) this.props.refreshList();
        this.forceUpdate();
    }

    render() {
        const {title, folder, contentList, contentState, onChange, reload} = this.props;
        const showReloadIcon = !Settings.get("settings", "addons", "autoReload");
        const button = folder ? {title: `Open ${title} Folder`, onClick: () => {require("electron").shell.openItem(folder);}} : null;
        return [
            <SettingsTitle key="title" text={title} button={button} otherChildren={showReloadIcon && <ReloadIcon className="bd-reload" onClick={this.reload.bind(this)} />} />,
            <ul key="ContentList" className={"bda-slist"}>
            {contentList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())).map(content => {
                const CardType = content.type ? PluginCard : ThemeCard;
                return <CardType showReloadIcon={showReloadIcon} key={content.id} enabled={contentState[content.id]} content={content} onChange={onChange} reload={reload} />;
            })}
            </ul>
        ];
    }
}