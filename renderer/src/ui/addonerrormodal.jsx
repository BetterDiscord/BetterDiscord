import {React, Strings, DiscordClasses, WebpackModules} from "modules";
import Extension from "./icons/extension";
import ThemeIcon from "./icons/theme";
import Divider from "./divider";

const {ModalHeader, ModalContent} = WebpackModules.getByProps("ModalRoot");
const Parser = Object(WebpackModules.getByProps("defaultRules", "parse")).defaultRules;

const joinClassNames = (...classNames) => classNames.filter(e => e).join(" ");

class AddonError extends React.Component {
    renderErrorBody(err) {
        const stack = err.error && err.stack;
        if (!stack) return null;
        
        return <div className="bd-addon-error-body">
            <Divider />
            <div className="bd-addon-error-stack">
                {Parser ? Parser.codeBlock.react({content: stack, lang: "js"}, null, {}) : stack}
            </div>
        </div>;
    }

    render() {
        const { err } = this.props;

        return <details
            key={`${err.type}-${this.props.index}`}
            className="bd-addon-error"
        >
            <summary className="bd-addon-error-header">
                <div className="bd-addon-error-icon">
                    {err.type == "plugin" ? <Extension /> : <ThemeIcon />}
                </div>
                <div className="bd-addon-error-header-inner">
                    <h3 className={`bd-addon-error-file ${DiscordClasses.Text.colorHeaderPrimary} ${DiscordClasses.Integrations.secondaryHeader} ${DiscordClasses.Text.size16}`}>
                        {err.name}
                    </h3>
                    <div className={`bd-addon-error-details ${DiscordClasses.Integrations.detailsWrapper}`}>
                        <svg className={DiscordClasses.Integrations.detailsIcon} aria-hidden="false" width="16" height="16" viewBox="0 0 12 12">
                            <path fill="currentColor" d="M6 1C3.243 1 1 3.244 1 6c0 2.758 2.243 5 5 5s5-2.242 5-5c0-2.756-2.243-5-5-5zm0 2.376a.625.625 0 110 1.25.625.625 0 010-1.25zM7.5 8.5h-3v-1h1V6H5V5h1a.5.5 0 01.5.5v2h1v1z"></path>
                        </svg>
                        <div className={`${DiscordClasses.Text.colorHeaderSecondary} ${DiscordClasses.Text.size12}`}>
                            {err.message}
                        </div>
                    </div>
                </div>
                <svg className="bd-addon-error-expander" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 10L12 15 17 10" aria-hidden="true"></path>
                </svg>
            </summary>
            {this.renderErrorBody(err)}
        </details>;
    }
}

export default class AddonErrorModal extends React.Component {
    constructor(props) {
        super(props);
        const tabs = this.getTabs();

        this.state = {
            selectedTab: tabs[0].id,
        };
    }

    mergeErrors(errors1 = [], errors2 = []) {
        const list = [];
        const allErrors = [...errors2, ...errors1];
        for (const error of allErrors) {
            if (list.find(e => e.file === error.file)) continue;
            list.push(error);
        }
        return list;
    }

    refreshTabs(pluginErrors, themeErrors) {
        this._tabs = null;
        this.props.pluginErrors = this.mergeErrors(this.props.pluginErrors, pluginErrors);
        this.props.themeErrors = this.mergeErrors(this.props.themeErrors, themeErrors);
        this.forceUpdate();
    }

    generateTab(id, errors) {
        return {
            id: id,
            name: Strings.Panels[id],
            errors: errors
        };
    }

    getTabs() {
        return this._tabs || (this._tabs = [
            this.props.pluginErrors.length && this.generateTab("plugins", this.props.pluginErrors),
            this.props.themeErrors.length && this.generateTab("themes", this.props.themeErrors)
        ].filter(e => e));
    }

    switchToTab(id) {
        this.setState({selectedTab: id});
    }

    render() {
        const selectedTab = this.getTabs().find(e => this.state.selectedTab === e.id);
        const tabs = this.getTabs();
        
        return <>
            <ModalHeader className={`bd-error-modal-header ${DiscordClasses.Modal.separator}`}>
                <h4 className={`${DiscordClasses.Titles.defaultColor} ${DiscordClasses.Text.size14} ${DiscordClasses.Titles.h4} ${DiscordClasses.Margins.marginBottom8}`}>
                    {Strings.Modals.addonErrors}
                </h4>
                <div className="bd-tab-bar">
                    {tabs.map(tab => (
                        <div
                            onClick={() => {this.switchToTab(tab.id)}}
                            className={joinClassNames("bd-tab-item", tab.id === selectedTab.id && "selected")}
                        >
                            {tab.name}
                        </div>
                    ))}
                </div>
            </ModalHeader>
            <ModalContent className="bd-error-modal-content">
                <div className="bd-addon-errors">
                    {selectedTab.errors.map((error, index) => <AddonError index={index} err={error} />)}
                </div>
            </ModalContent>
        </>;
    }
}