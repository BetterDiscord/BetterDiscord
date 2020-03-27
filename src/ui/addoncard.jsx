import {settingsCookie} from "../0globals";
import BDV2 from "../modules/v2";
import Utils from "../modules/utils";

import XSvg from "./xSvg";
import ReloadIcon from "./reloadIcon";
import EditIcon from "./icons/edit";
import DeleteIcon from "./icons/delete";
import Switch from "./components/switch";
import TooltipWrap from "./tooltipWrap";

const React = BDV2.React;

export default class V2C_PluginCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.showSettings = this.showSettings.bind(this);
        this.setInitialState();
        this.hasSettings = typeof this.props.addon.getSettingsPanel === "function";
        this.settingsPanel = "";

        this.edit = this.edit.bind(this);
        this.delete = this.delete.bind(this);
        this.reload = this.reload.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: this.props.enabled,
            settings: false,
            reloads: 0
        };
    }

    showSettings() {
        if (!this.hasSettings) return;
        this.setState({settings: true});
    }

    closeSettings() {
        this.panelRef.current.innerHTML = "";
        this.setState({settingsOpen: false});
    }

    componentDidUpdate() {
        if (!this.state.settings) return;
        if (typeof this.settingsPanel === "object") {
            this.refs.settingspanel.appendChild(this.settingsPanel);
        }

        if (!settingsCookie["fork-ps-3"]) return;
        const isHidden = (container, element) => {
            const cTop = container.scrollTop;
            const cBottom = cTop + container.clientHeight;
            const eTop = element.offsetTop;
            const eBottom = eTop + element.clientHeight;
            return  (eTop < cTop || eBottom > cBottom);
        };

        const thisNode = $(BDV2.reactDom.findDOMNode(this));
        const container = thisNode.parents(".scroller");
        if (!isHidden(container[0], thisNode[0])) return;
        container.animate({
            scrollTop: thisNode.offset().top - container.offset().top + container.scrollTop() - 30
        }, 300);
    }


    getString(value) {
        if (!value) return "???";
        return typeof value == "string" ? value : value.toString();
    }

    get settingsComponent() {
        const name = this.getString(this.props.addon.name);

        try { this.settingsPanel = this.props.addon.getSettingsPanel(); }
        catch (err) { Utils.err("Plugins", "Unable to get settings panel for " + this.props.addon.name + ".", err); }

        return BDV2.react.createElement("div", {className: "bd-card bd-addon-card settings-open ui-switch-item"},
                BDV2.react.createElement("div", {style: {"float": "right", "cursor": "pointer"}, onClick: () => {
                        this.refs.settingspanel.innerHTML = "";
                        this.setState({settings: false});
                    }},
                BDV2.react.createElement(XSvg, null)
            ),
            typeof this.settingsPanel === "object" && BDV2.react.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel"}),
            typeof this.settingsPanel !== "object" && BDV2.react.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel", dangerouslySetInnerHTML: {__html: this.settingsPanel}})
        );
    }

    buildTitle(name, version, author) {
        const title = "{{name}} v{{version}} by {{author}}".split(/({{[A-Za-z]+}})/);
        const nameIndex = title.findIndex(s => s == "{{name}}");
        if (nameIndex) title[nameIndex] = React.createElement("span", {className: "name bda-name"}, name);
        const versionIndex = title.findIndex(s => s == "{{version}}");
        if (nameIndex) title[versionIndex] = React.createElement("span", {className: "version bda-version"}, version);
        const authorIndex = title.findIndex(s => s == "{{author}}");
        if (nameIndex) {
            const props = {className: "author bda-author"};
            if (author.link || author.id) {
                props.className += ` ${BDV2.anchorClasses.anchor} ${BDV2.anchorClasses.anchorUnderlineOnHover}`;
                props.target = "_blank";

                if (author.link) props.href = author.link;
                if (author.id) props.onClick = () => {BDV2.LayerStack.popLayer(); BDV2.openDM(author.id);};
            }
            title[authorIndex] = React.createElement(author.link || author.id ? "a" : "span", props, author.name);
        }
        return title.flat();
    }

    makeLink(title, url) {
        const props = {className: "bda-link bda-link-website", target: "_blank"};
        if (typeof(url) == "string") props.href = url;
        if (typeof(url) == "function") props.onClick = (event) => {event.preventDefault(); event.stopPropagation(); url();};
        return BDV2.react.createElement("a", props, title);
    }

    makeButton(title, children, action) {
        return <TooltipWrap color="black" side="top" text={title}>
            <div className="bd-addon-button" onClick={action}>{children}</div>
        </TooltipWrap>;
        // return  <Tooltip color="black" position="top" text={title}>
        //             {(props) => {
        //                 return <div {...props} className="bd-icon" onClick={action}>{children}</div>;
        //             }}
        //         </Tooltip>;
    }

    get links() {
        const links = [];
        const addon = this.props.addon;
        if (addon.website) links.push(this.makeLink("Website", addon.website));
        if (addon.source) links.push(this.makeLink("Source", addon.source));
        if (addon.invite) {
            links.push(this.makeLink("Support Server", () => {
                const tester = /\.gg\/(.*)$/;
                let code = addon.invite;
                if (tester.test(code)) code = code.match(tester)[1];
                BDV2.LayerStack.popLayer();
                BDV2.InviteActions.acceptInviteAndTransitionToInviteChannel(code);
            }));
        }
        if (addon.donate) links.push(this.makeLink("Donate", addon.donate));
        if (addon.patreon) links.push(this.makeLink("Patreon", addon.patreon));
        return links;
    }

    get footer() {
        const links = this.links;
        return (links.length || this.hasSettings) && BDV2.react.createElement("div", {className: "bd-card-footer bda-footer"},
            BDV2.react.createElement("span", {className: "bd-addon-links bda-links"},
                ...(links.map((element, index) => index < links.length - 1 ? [element, " | "] : element).flat())
            ),
            this.hasSettings && BDV2.react.createElement("button", {onClick: this.showSettings, className: "bd-button bda-settings-button", disabled: !this.state.checked}, "Settings")
        );
    }

    onChange() {
        this.props.toggle && this.props.toggle(this.props.addon.name);
        this.props.enabled = !this.props.enabled;
    }

    edit() {this.props.edit(this.props.addon.name);}
    delete() {this.props.remove(this.props.addon.name);}
    reload() {this.props.reload(this.props.addon.name);}

    render() {
        if (this.state.settings) return this.settingsComponent;

        const {name, author, description, version, authorId, authorLink} = this.props.addon;

        return BDV2.react.createElement("div", {className: "bd-card bd-addon-card settings-closed ui-switch-item"},
            BDV2.react.createElement("div", {className: "bd-addon-header bda-header"},
                    BDV2.react.createElement("div", {className: "bd-card-title bda-header-title"}, this.buildTitle(name, version, {name: author, id: authorId, link: authorLink})),
                    BDV2.react.createElement("div", {className: "bd-addon-controls bda-controls"},
                        this.props.edit && this.makeButton("Edit", <EditIcon className="bd-icon" />, this.edit),
                        this.props.remove && this.makeButton("Delete", <DeleteIcon className="bd-icon" />, this.delete),
                        this.props.reload && this.makeButton("Reload", <ReloadIcon className="bd-icon" />, this.reload),
                        React.createElement(Switch, {onChange: this.onChange, checked: this.props.enabled})
                    )
            ),
            BDV2.react.createElement("div", {className: "bd-scroller-wrap bda-description-wrap scroller-wrap fade"},
                BDV2.react.createElement("div", {className: "bd-scroller bd-addon-description bda-description scroller"}, description)
            ),
            this.footer
        );
    }
}


// get settingsComponent() {
//     const addon = this.props.addon;
//     const name = this.getString(addon.name);
//     try { this.settingsPanel = this.props.getSettingsPanel(); }
//     catch (err) { Logger.stacktrace("Addon Settings", "Unable to get settings panel for " + name + ".", err); }

//     const props = {id: `${name}-settings`, className: "addon-settings", ref: this.panelRef};
//     if (typeof(settingsPanel) == "string") props.dangerouslySetInnerHTML = this.settingsPanel;

//     return <div className="bd-addon-card settings-open bd-switch-item">
//                 <div className="bd-close" onClick={this.closeSettings}><CloseButton /></div>
//                 <div {...props}>{this.settingsPanel instanceof React.Component ? this.settingsPanel : null}</div>
//             </div>;
// }

// componentDidUpdate() {
//     if (!this.state.settingsOpen) return;
//     if (this.settingsPanel instanceof Node) this.panelRef.current.appendChild(this.settingsPanel);

//     // if (!SettingsCookie["fork-ps-3"]) return;
//     const isHidden = (container, element) => {
//         const cTop = container.scrollTop;
//         const cBottom = cTop + container.clientHeight;
//         const eTop = element.offsetTop;
//         const eBottom = eTop + element.clientHeight;
//         return  (eTop < cTop || eBottom > cBottom);
//     };

//     const panel = $(this.panelRef.current);
//     const container = panel.parents(".scroller-2FKFPG");
//     if (!isHidden(container[0], panel[0])) return;
//     container.animate({
//         scrollTop: panel.offset().top - container.offset().top + container.scrollTop() - 30
//     }, 300);
// }