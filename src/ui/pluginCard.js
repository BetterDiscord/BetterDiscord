import {settingsCookie, pluginCookie, bdplugins} from "../0globals";
import BDV2 from "../modules/v2";
import pluginModule from "../modules/pluginModule";
import Utils from "../modules/utils";

import XSvg from "./xSvg";
import ReloadIcon from "./reloadIcon";
import TooltipWrap from "./tooltipWrap";

export default class V2C_PluginCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        const self = this;
        self.onChange = self.onChange.bind(self);
        self.showSettings = self.showSettings.bind(self);
        self.setInitialState();
        self.hasSettings = typeof self.props.plugin.getSettingsPanel === "function";
        self.settingsPanel = "";

        this.reload = this.reload.bind(this);
        this.onReload = this.onReload.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: pluginCookie[this.props.plugin.getName()],
            settings: false,
            reloads: 0
        };
    }

    // componentDidMount() {
    //     BDEvents.on("plugin-reloaded", this.onReload);
    // }

    // componentWillUnmount() {
    //     BDEvents.off("plugin-reloaded", this.onReload);
    // }

    onReload(pluginName) {
        if (pluginName !== this.props.plugin.getName()) return;
        this.setState({reloads: this.state.reloads + 1});
    }

    componentDidUpdate() {
        if (this.state.settings) {
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

            const self = $(BDV2.reactDom.findDOMNode(this));
            const container = self.parents(".scroller");
            if (!isHidden(container[0], self[0])) return;
            container.animate({
                scrollTop: self.offset().top - container.offset().top + container.scrollTop() - 30
            }, 300);
        }
    }

    reload() {
        const plugin = this.props.plugin.getName();
        pluginModule.reloadPlugin(plugin);
        this.props.plugin = bdplugins[plugin].plugin;
        this.onReload(this.props.plugin.getName());
    }

    getString(value) {
        if (!value) return "???";
        return typeof value == "string" ? value : value.toString();
    }

    makeLink(title, url) {
        const props = {className: "bda-link bda-link-website", target: "_blank"};
        if (typeof(url) == "string") props.href = url;
        if (typeof(url) == "function") props.onClick = (event) => {event.preventDefault(); event.stopPropagation(); url();};
        return BDV2.react.createElement("a", props, title);
    }

    render() {
        
        const self = this;
        const {plugin} = this.props;
        const name = this.getString(plugin.getName());
        const author = this.getString(plugin.getAuthor());
        const description = this.getString(plugin.getDescription());
        const version = this.getString(plugin.getVersion());
        const meta = bdplugins[name];

        if (this.state.settings) {
            try { self.settingsPanel = plugin.getSettingsPanel(); }
            catch (err) { Utils.err("Plugins", "Unable to get settings panel for " + plugin.getName() + ".", err); }

            return BDV2.react.createElement("li", {className: "settings-open ui-switch-item"},
                    BDV2.react.createElement("div", {style: {"float": "right", "cursor": "pointer"}, onClick: () => {
                            this.refs.settingspanel.innerHTML = "";
                            self.setState({settings: false});
                        }},
                    BDV2.react.createElement(XSvg, null)
                ),
                typeof self.settingsPanel === "object" && BDV2.react.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel"}),
                typeof self.settingsPanel !== "object" && BDV2.react.createElement("div", {id: `plugin-settings-${name}`, className: "plugin-settings", ref: "settingspanel", dangerouslySetInnerHTML: {__html: self.settingsPanel}})
            );
        }

        const links = [];
        if (meta.website) links.push(this.makeLink("Website", meta.website));
        if (meta.source) links.push(this.makeLink("Source", meta.source));
        if (meta.invite) {
            links.push(this.makeLink("Support Server", () => {
                const tester = /\.gg\/(.*)$/;
                let code = meta.invite;
                if (tester.test(code)) code = code.match(tester)[1];
                BDV2.LayerStack.popLayer();
                BDV2.InviteActions.acceptInviteAndTransitionToInviteChannel(code);
            }));
        }
        if (meta.donate) links.push(this.makeLink("Donate", meta.donate));
        if (meta.patreon) links.push(this.makeLink("Patreon", meta.patreon));

        const authorProps = {className: "bda-author"};
        if (meta.authorLink || meta.authorId) {
            authorProps.className += ` ${BDV2.anchorClasses.anchor} ${BDV2.anchorClasses.anchorUnderlineOnHover}`;
            authorProps.target = "_blank";

            if (meta.authorLink) authorProps.href = meta.authorLink;
            if (meta.authorId) authorProps.onClick = () => {BDV2.LayerStack.popLayer(); BDV2.openDM(meta.authorId);};
        }
        

        return BDV2.react.createElement("li", {"data-name": name, "data-version": version, "className": "settings-closed ui-switch-item"},
            BDV2.react.createElement("div", {className: "bda-header"},
                    BDV2.react.createElement("span", {className: "bda-header-title"},
                        BDV2.react.createElement("span", {className: "bda-name"}, name),
                        " v",
                        BDV2.react.createElement("span", {className: "bda-version"}, version),
                        " by ",
                        BDV2.react.createElement(meta.authorLink || meta.authorId ? "a" : "span", authorProps, author)
                    ),
                    BDV2.react.createElement("div", {className: "bda-controls"},
                        !settingsCookie["fork-ps-5"] && BDV2.react.createElement(TooltipWrap(ReloadIcon, {color: "black", side: "top", text: "Reload"}), {className: "bd-reload-card", onClick: this.reload}),
                        BDV2.react.createElement("label", {className: "ui-switch-wrapper ui-flex-child", style: {flex: "0 0 auto"}},
                            BDV2.react.createElement("input", {checked: this.state.checked, onChange: this.onChange, className: "ui-switch-checkbox", type: "checkbox"}),
                            BDV2.react.createElement("div", {className: this.state.checked ? "ui-switch checked" : "ui-switch"})
                        )
                    )
            ),
            BDV2.react.createElement("div", {className: "bda-description-wrap scroller-wrap fade"},
                BDV2.react.createElement("div", {className: "bda-description scroller"}, description)
            ),
            (links.length || this.hasSettings) && BDV2.react.createElement("div", {className: "bda-footer"},
                BDV2.react.createElement("span", {className: "bda-links"},
                    ...(links.map((element, index) => index < links.length - 1 ? [element, " | "] : element).flat())
                ),
                this.hasSettings && BDV2.react.createElement("button", {onClick: this.showSettings, className: "bda-settings-button", disabled: !this.state.checked}, "Settings")
            )
        );
    }

    onChange() {
        this.setState({checked: !this.state.checked});
        pluginModule.togglePlugin(this.props.plugin.getName());
    }

    showSettings() {
        if (!this.hasSettings) return;
        this.setState({settings: true});
    }
}