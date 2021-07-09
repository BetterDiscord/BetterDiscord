import Logger from "common/logger";
import {React, Strings, WebpackModules, DiscordModules} from "modules";
import SimpleMarkdown from "../../structs/markdown";
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
import ExtIcon from "../icons/extension";
import ThemeIcon from "../icons/theme";
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
const LayerStack = WebpackModules.getByProps("popLayer");
const UserStore = WebpackModules.getByProps("getCurrentUser");
const ChannelStore = WebpackModules.getByProps("getDMFromUserId");
const PrivateChannelActions = WebpackModules.getByProps("openPrivateChannel");
const ChannelActions = WebpackModules.getByProps("selectPrivateChannel");

export default class AddonCard extends React.Component {

    constructor(props) {
        super(props);

        this.settingsPanel = "";
        this.panelRef = React.createRef();

        this.onChange = this.onChange.bind(this);
        this.reload = this.reload.bind(this);
        this.showSettings = this.showSettings.bind(this);
        this.messageAuthor = this.messageAuthor.bind(this);
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

    messageAuthor() {
        if (!this.props.addon.authorId) return;
        if (LayerStack) LayerStack.popLayer();
        if (!UserStore || !ChannelActions || !ChannelStore || !PrivateChannelActions) return;
        const selfId = UserStore.getCurrentUser().id;
        if (selfId == this.props.addon.authorId) return;
        const privateChannelId = ChannelStore.getDMFromUserId(this.props.addon.authorId);
        if (privateChannelId) return ChannelActions.selectPrivateChannel(privateChannelId);
        PrivateChannelActions.openPrivateChannel(selfId, this.props.addon.authorId);
    }

    buildTitle(name, version, author) {
        const authorArray = Strings.Addons.byline.split(/({{[A-Za-z]+}})/);
        const authorComponent = author.link || author.id
                                ? <a className="bd-link bd-link-website" href={author.link || null} onClick={this.messageAuthor} target="_blank" rel="noopener noreferrer">{author.name}</a>
                                : <span className="bd-author">{author.name}</span>;

        const authorIndex = authorArray.findIndex(s => s == "{{author}}");
        if (authorIndex) authorArray[authorIndex] = authorComponent;

        return [
            React.createElement("div", {className: "bd-name"}, name),
            React.createElement("div", {className: "bd-meta"}, 
                React.createElement("span", {className: "bd-version"}, `v${version}`),
                ...authorArray
            )
        ];
            
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
        return <Tooltip color="primary" position="top" text={title}>
                    {(props) => {
                        return <div {...props} className="bd-addon-button" onClick={action}>{children}</div>;
                    }}
                </Tooltip>;
    }

    makeControlButton(title, children, action, {danger = false, disabled = false} = {}) {
        return <Tooltip color="primary" position="top" text={title}>
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
                            {this.props.type === "plugin" ? <ExtIcon size="18px" className="bd-icon" /> : <ThemeIcon size="18px" className="bd-icon" />}
                            <div className="bd-title">{this.buildTitle(name, version, {name: author, id: this.props.addon.authorId, link: this.props.addon.authorLink})}</div>
                            <Switch checked={this.props.enabled} onChange={this.onChange} />
                    </div>
                    <div className="bd-description-wrap"><div className="bd-description">{SimpleMarkdown.parseToReact(description)}</div></div>
                    {this.footer}
                </div>;
    }
}

const originalRender = AddonCard.prototype.render;
Object.defineProperty(AddonCard.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function() {Logger.warn("AddonCard", "Addon policy for plugins #5 https://github.com/BetterDiscord/BetterDiscord/wiki/Addon-Policies#plugins");},
    get: () => originalRender
});