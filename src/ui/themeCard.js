import {settingsCookie, themeCookie, bdthemes} from "../0globals";
import Utils from "../modules/utils";
import BDV2 from "../modules/v2";
import themeModule from "../modules/themeModule";

import ReloadIcon from "./reloadIcon";
import TooltipWrap from "./tooltipWrap";

export default class V2C_ThemeCard extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        this.setInitialState();
        this.onChange = this.onChange.bind(this);
        this.reload = this.reload.bind(this);
    }

    setInitialState() {
        this.state = {
            checked: themeCookie[this.props.theme.name],
            reloads: 0
        };
    }

    // componentDidMount() {
    //     BDEvents.on("theme-reloaded", this.onReload);
    // }

    // componentWillUnmount() {
    //     BDEvents.off("theme-reloaded", this.onReload);
    // }

    onReload(themeName) {
        if (themeName !== this.props.theme.name) return;
        this.setState({reloads: this.state.reloads + 1});
    }

    reload() {
        const theme = this.props.theme.name;
        const error = themeModule.reloadTheme(theme);
        if (error) Utils.showToast(`Could not reload ${bdthemes[theme].name}. Check console for details.`, {type: "error"});
        else Utils.showToast(`${bdthemes[theme].name} v${bdthemes[theme].version} has been reloaded.`, {type: "success"});
        // this.setState(this.state);
        this.props.theme = bdthemes[theme];
        this.onReload(this.props.theme.name);
    }

    makeLink(title, url) {
        const props = {className: "bda-link bda-link-website", target: "_blank"};
        if (typeof(url) == "string") props.href = url;
        if (typeof(url) == "function") props.onClick = (event) => {event.preventDefault(); event.stopPropagation(); url();};
        return BDV2.react.createElement("a", props, title);
    }

    render() {
        const {theme} = this.props;
        const name = theme.name;
        const description = theme.description;
        const version = theme.version;
        const author = theme.author;
        const meta = bdthemes[name];

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

        return BDV2.react.createElement("div", {"data-name": name, "data-version": version, "className": "settings-closed ui-switch-item bd-addon-card"},
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
            (!!links.length) && BDV2.react.createElement("div", {className: "bda-footer"},
                BDV2.react.createElement("span", {className: "bda-links"},
                    ...(links.map((element, index) => index < links.length - 1 ? [element, " | "] : element).flat())
                )
            )
        );
    }

    onChange() {
        this.setState({checked: !this.state.checked});
        themeModule.toggleTheme(this.props.theme.name);
    }
}