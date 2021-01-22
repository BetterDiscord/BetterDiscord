import {React, Strings, WebpackModules} from "modules";
import DownArrow from "./icons/downarrow";
import Extension from "./icons/extension";
import ThemeIcon from "./icons/theme";

const Parser = Object(WebpackModules.getByProps("defaultRules", "parse")).defaultRules;

const joinClassNames = (...classNames) => classNames.filter(e => e).join(" ");

class Collapse extends React.Component {
    constructor(props) {
        super(props);
        this.state = {opened: false};
    }

    toggle() {
        if (!this.props.error.stack) return;
        this.setState({opened: !this.state.opened});
    }

    render() {
        const title = this.props.error.error ? this.props.error.message : this.props.error.message;
        const stack = this.props.error.error && this.props.error.error.stack;
        
        return <div className={joinClassNames("bd-addonError-stack", this.state.opened && "opened")}>
            <div onClick={() => {this.toggle();}} className="bd-addonError-stack-header">
                {!this.state.opened && title}
                {stack
                    ? <>
                        <DownArrow />
                        {this.state.opened && <div className="bd-addonError-stack-shown">{Parser ? Parser.codeBlock.react({content: stack, lang: "js"}, null, {}) : stack}</div>}
                    </>
                    : null}
            </div>
        </div>;
    }
}

export default class AddonErrorModal extends React.Component {
    constructor(props) {
        super(props);

        const tabs = this.getTabs();

        this.state = {
            selectedTab: tabs[0].id
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

    renderError(err) {
        return <div className="bd-addonError">
            <div className="bd-addonError-header">
                {err.type == "plugin" ? <Extension /> : <ThemeIcon />}
                <div className="bd-addonError-message">{err.name} - {err.message}</div>
            </div>
            <div className="bd-addonError-body">
                <Collapse error={err} message={err.message} />
            </div>
        </div>;
    }

    switchToTab(id) {
        this.setState({selectedTab: id});
    }

    render() {
        const selectedTab = this.getTabs().find(e => this.state.selectedTab === e.id);
        const tabs = this.getTabs();
        return <div className="bd-modal bd-content-modal modal-1UGdnR">
            <div className="bd-modal-inner inner-1JeGVc">
                <div className="header header-1R_AjF"><div className="title">{Strings.Modals.addonErrors}</div></div>
                <div className="bd-modal-body">
                    <div className="tab-bar-container">
                        <div className="tab-bar TOP">
                            {tabs.map(tab => <div onClick={() => {this.switchToTab(tab.id);}} className={joinClassNames("tab-bar-item", tab.id === selectedTab.id && "selected")}>{tab.name}</div>)}
                        </div>
                    </div>
                    <div className="scroller-wrap fade">
                        <div className="scroller">
                            {selectedTab.errors.map(error => this.renderError(error))}
                        </div>
                    </div>
                </div>
                <div className="footer footer-2yfCgX footer-3rDWdC footer-2gL1pp">
                    <button type="button" onClick={() => {this.props.onClose();}} className="bd-button">{Strings.Modals.okay}</button>
                </div>
            </div>
        </div>;
    }
}