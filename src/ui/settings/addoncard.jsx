import {React, Logger, Strings, WebpackModules, DiscordModules} from "modules";
import ReloadIcon from "../icons/reload";
import EditIcon from "../icons/edit";
import DeleteIcon from "../icons/delete";
import CogIcon from "../icons/cog";
import Switch from "./components/switch";

import GitHubIcon from "../icons/github";
import MoneyIcon from "../icons/dollarsign";
import WebIcon from "../icons/globe";
import PatreonIcon from "../icons/patreon";
import SupportIcon from "../icons/support";
import Modals from "../modals";
import Toasts from "../toasts";

const LinkIcons = {
    website: WebIcon,
    source: GitHubIcon,
    invite: SupportIcon,
    donate: MoneyIcon,
    patreon: PatreonIcon
};

const Tooltip = WebpackModules.getByDisplayName("Tooltip");
const MarkdownParser = WebpackModules.getByProps("markdownToReact");

export default class AddonCard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            settingsOpen: false
        };

        this.settingsPanel = "";
        this.panelRef = React.createRef();

        this.onChange = this.onChange.bind(this);
        this.reload = this.reload.bind(this);
        this.showSettings = this.showSettings.bind(this);
    }

    showSettings() {
        if (!this.props.hasSettings || !this.props.enabled) return;
        const name = this.getString(this.props.addon.name);
        try {
            Modals.showAddonSettingsModal(name, this.props.getSettingsPanel());
        }
        catch (err) {
            Toasts.show(Strings.Addons.settingsError.format({name}), {type: "error"});
            Logger.stacktrace("Addon Settings", "Unable to get settings panel for " + name + ".", err);
        }
    }

    reload() {
        if (!this.props.reload) return;
        this.props.addon = this.props.reload(this.props.addon.id);
        this.forceUpdate();
    }

    getString(value) {return typeof value == "string" ? value : value.toString();}

    onChange() {
        this.props.onChange && this.props.onChange(this.props.addon.id);
        this.props.enabled = !this.props.enabled;
        this.forceUpdate();
    }

    buildTitle(name, version, author) {
        const title = Strings.Addons.title.split(/({{[A-Za-z]+}})/);
        const nameIndex = title.findIndex(s => s == "{{name}}");
        if (nameIndex) title[nameIndex] = React.createElement("span", {className: "bd-name"}, name);
        const versionIndex = title.findIndex(s => s == "{{version}}");
        if (nameIndex) title[versionIndex] = React.createElement("span", {className: "bd-version"}, version);
        const authorIndex = title.findIndex(s => s == "{{author}}");
        if (nameIndex) title[authorIndex] = React.createElement("span", {className: "bd-author"}, author);
        return title.flat();
    }

    buildLink(which) {
        const url = this.props.addon[which];
        if (!url) return null;
        const icon = React.createElement(LinkIcons[which]);
        const link = <a className="bd-link bd-link-website" href={url} target="_blank" rel="noopener noreferrer">{icon}</a>;
        if (which == "invite") {
            link.props.onClick = function(event) {
                event.preventDefault();
                event.stopPropagation();
                let code = url;
                const tester = /\.gg\/(.*)$/;
                if (tester.test(code)) code = code.match(tester)[1];
                DiscordModules.LayerStack.popLayer();
                DiscordModules.InviteActions.acceptInviteAndTransitionToInviteChannel(code);
            };
        }
        return this.makeButton(Strings.Addons[which], link);
    }

    get controls() { // {this.props.hasSettings && <button onClick={this.showSettings} className="bd-button bd-button-addon-settings" disabled={!this.props.enabled}>{Strings.Addons.addonSettings}</button>}
        return <div className="bd-controls">
                    {this.props.hasSettings && this.makeControlButton(Strings.Addons.addonSettings, <CogIcon size={"20px"} />, this.showSettings, {disabled: !this.props.enabled})}
                    {this.props.showReloadIcon && this.makeControlButton(Strings.Addons.reload, <ReloadIcon size={"20px"} />, this.reload)}
                    {this.props.editAddon && this.makeControlButton(Strings.Addons.editAddon, <EditIcon size={"20px"} />, this.props.editAddon)}
                    {this.props.deleteAddon && this.makeControlButton(Strings.Addons.deleteAddon, <DeleteIcon size={"20px"} />, this.props.deleteAddon, {danger: true})}
                </div>;
    }

    get footer() {
        const links = ["website", "source", "invite", "donate", "patreon"];
        const linkComponents = links.map(this.buildLink.bind(this)).filter(c => c);// linkComponents.map((comp, i) => i < linkComponents.length - 1 ? [comp, " | "] : comp).flat()
        return <div className="bd-footer">
                    <span className="bd-links">{linkComponents}</span> 
                    {this.controls}
                </div>;
    }

    makeButton(title, children, action) {
        return <Tooltip color="black" position="top" text={title}>
                    {(props) => {
                        return <div {...props} className="bd-addon-button" onClick={action}>{children}</div>;
                    }}
                </Tooltip>;
    }

    makeControlButton(title, children, action, {danger = false, disabled = false} = {}) {
        return <Tooltip color="black" position="top" text={title}>
                    {(props) => {
                        return <button {...props} className={"bd-button bd-addon-button" + (danger ? " bd-button-danger" : "") + (disabled ? " bd-button-disabled" : "")} onClick={action}>{children}</button>;
                    }}
                </Tooltip>;
    }

    render() {
        const addon = this.props.addon;
        const name = this.getString(addon.name);
        const author = this.getString(addon.author);
        const description = this.getString(addon.description);
        const version = this.getString(addon.version);

        return <div id={`${addon.id}-card`} className="bd-addon-card settings-closed">
                    <div className="bd-addon-header">
                            <span className="bd-title">{this.buildTitle(name, version, author)}</span>
                            <Switch checked={this.props.enabled} onChange={this.onChange} />
                    </div>
                    <div className="bd-description-wrap scroller-wrap fade"><div className="bd-description scroller">{MarkdownParser.markdownToReact(description)}</div></div>
                    {this.footer}
                </div>;
    }
}

const originalRender = AddonCard.prototype.render;
Object.defineProperty(AddonCard.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function() {Logger.warn("AddonCard", "Addon policy for plugins #5 https://github.com/rauenzi/BetterDiscordApp/wiki/Addon-Policies#plugins");},
    get: () => originalRender
});