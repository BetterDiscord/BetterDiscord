import {React, Settings} from "modules";

import Checkbox from "./checkbox";
import SettingsTitle from "../settings/title";

export default class CssEditor extends React.Component {

    constructor(props) {
        super(props);

        this.toggleLiveUpdate = this.toggleLiveUpdate.bind(this);
        this.updateCss = this.updateCss.bind(this);
        this.saveCss = this.saveCss.bind(this);
        this.openDetached = this.props.openDetached ? this.openDetached.bind(this) : null;
        this.openNative = this.openNative.bind(this);
    }

    componentDidMount() {
        this.editor = ace.edit(this.props.editorId || "bd-customcss-editor");

        // Add id to the ace menu container
        const originalShow = this.editor.keyBinding.$defaultHandler.commands.showSettingsMenu.exec;
        this.editor.keyBinding.$defaultHandler.commands.showSettingsMenu.exec = function() {
            originalShow.apply(this, arguments);
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (!mutation.addedNodes.length || !(mutation.addedNodes[0] instanceof Element)) continue;
                    const node = mutation.addedNodes[0];
                    if (node.parentElement !== document.body || !node.querySelector("#ace_settingsmenu")) continue;
                    node.id = "ace_settingsmenu_container";
                    observer.disconnect();
                }
            });
            observer.observe(document.body, {childList: true});
        };

        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/css");
        this.editor.setShowPrintMargin(false);
        this.editor.setFontSize(14);
        this.editor.on("change", () => {
            if (!Settings.get("settings", "customcss", "liveUpdate")) return;
            this.saveCss();
            this.updateCss();
        });
    }

    componentWillUnmount() {
        this.editor.destroy();
    }

    render() {

        return [
            <div className="editor-wrapper">
                <div id={this.props.editorId || "bd-customcss-editor"} className="editor">{this.props.css}</div>
            </div>,
            <div id="bd-customcss-attach-controls">
                <div className="checkbox-group">
                    <Checkbox text="Live Update" onChange={this.toggleLiveUpdate} checked={Settings.get("settings", "customcss", "liveUpdate")} />
                </div>
                <div id="bd-customcss-detach-controls-button">
                    <button className="btn btn-primary" onClick={this.updateCss}>Update</button>
                    <button className="btn btn-primary" onClick={this.saveCss}>Save</button>
                    <button className="btn btn-primary" onClick={this.openNative}>Open Natively</button>
                    {this.openDetached && [<button className="btn btn-primary" onClick={this.openDetached}>Detach</button>, <span className="small-notice">Unsaved changes are lost on detach</span>]}
                    <div className="help-text">
                        Press <code className="inline">ctrl</code>+<code className="inline">,</code> with the editor focused to access the editor&apos;s settings.
                    </div>
                </div>
            </div>
        ];
    }

    toggleLiveUpdate(checked) {
        Settings.set("settings", "customcss", "liveUpdate", checked);
    }

    updateCss() {
        const newCss = this.editor.session.getValue();
        if (this.props.update) this.props.update(newCss);
    }

    saveCss() {
        const newCss = this.editor.session.getValue();
        if (this.props.save) this.props.save(newCss);
    }

    openDetached() {
        if (this.props.openDetached) this.props.openDetached();
    }

    openNative() {
        if (this.props.openNative) this.props.openNative();
    }
}