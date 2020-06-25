import {settingsCookie} from "../0globals";
import Settings from "../modules/settingsPanel";
import BDV2 from "../modules/v2";
import DataStore from "../modules/dataStore";
import DOM from "../modules/domtools";

import SettingsTitle from "./settingsTitle";
import Checkbox from "./checkbox";
import V2C_CssEditorDetached from "./cssEditorDetached";

export default class V2C_CssEditor extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        const self = this;
        self.props.lines = 0;
        self.setInitialState();
        self.attach = self.attach.bind(self);
        self.detachedEditor = BDV2.react.createElement(V2C_CssEditorDetached, {attach: self.attach});
        self.onClick = self.onClick.bind(self);
        self.updateCss = self.updateCss.bind(self);
        self.saveCss = self.saveCss.bind(self);
        self.detach = self.detach.bind(self);
    }

    setInitialState() {
        this.state = {
            detached: this.props.detached || BDV2.editorDetached
        };
    }

    componentDidMount() {
        // this.updateLineCount();
        this.editor = ace.edit("bd-customcss-editor");
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/css");
        this.editor.setShowPrintMargin(false);
        this.editor.setFontSize(14);
        this.editor.on("change", () => {
            if (!settingsCookie["bda-css-0"]) return;
            this.saveCss();
            this.updateCss();
        });
    }

    componentWillUnmount() {
        this.editor.destroy();
    }

    componentDidUpdate(prevProps, prevState) {
        const self = this;
        if (prevState.detached && !self.state.detached) {
            BDV2.reactDom.unmountComponentAtNode(self.detachedRoot);
        }
    }

    codeMirror() {
    }

    get options() {
        return {
            lineNumbers: true,
            mode: "css",
            indentUnit: 4,
            theme: "material",
            scrollbarStyle: "simple"
        };
    }

    get css() {
        const _ccss = DataStore.getBDData("bdcustomcss");
        let ccss = "";
        if (_ccss && _ccss !== "") {
            ccss = atob(_ccss);
        }
        return ccss;
    }

    updateLineCount() {
        const lineCount = this.refs.editor.value.split("\n").length;
        if (lineCount == this.props.lines) return;
        this.refs.lines.textContent = Array.from(new Array(lineCount), (_, i) => i + 1).join(".\n") + ".";
        this.props.lines = lineCount;
    }

    render() {
        const self = this;

        const {detached} = self.state;
        return BDV2.react.createElement(
            "div",
            {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default", style: {padding: "60px 40px 0px"}},
            detached && BDV2.react.createElement(
                "div",
                {id: "editor-detached"},
                BDV2.react.createElement(SettingsTitle, {text: "Custom CSS Editor"}),
                BDV2.react.createElement(
                    "h3",
                    null,
                    "Editor Detached"
                ),
                BDV2.react.createElement(
                    "button",
                    {className: "btn btn-primary", onClick: () => {
                            self.attach();
                        }},
                    "Attach"
                )
            ),
            !detached && BDV2.react.createElement(
                "div",
                null,
                BDV2.react.createElement(SettingsTitle, {text: "Custom CSS Editor"}),
                BDV2.react.createElement("div", {className: "editor-wrapper"},
                    BDV2.react.createElement("div", {id: "bd-customcss-editor", className: "editor", ref: "editor"}, self.css)
                ),
                BDV2.react.createElement(
                    "div",
                    {id: "bd-customcss-attach-controls"},
                    BDV2.react.createElement(
                        "ul",
                        {className: "checkbox-group"},
                        BDV2.react.createElement(Checkbox, {id: "live-update", text: "Live Update", onChange: this.onChange, checked: settingsCookie["bda-css-0"]})
                    ),
                    BDV2.react.createElement(
                        "div",
                        {id: "bd-customcss-detach-controls-button"},
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                }},
                            "Update"
                        ),
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                }},
                            "Save"
                        ),
                        BDV2.react.createElement(
                            "button",
                            {style: {borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("detach");
                                }},
                            "Detach"
                        ),
                        BDV2.react.createElement(
                            "span",
                            {style: {fontSize: "10px", marginLeft: "5px"}},
                            "Unsaved changes are lost on detach"
                        ),
                        BDV2.react.createElement("div", {className: "help-text"},
                            "Press ",
                            BDV2.react.createElement("code", {className: "inline"}, "ctrl"),
                            "+",
                            BDV2.react.createElement("span", {className: "inline"}, ","),
                            " with the editor focused to access the editor's settings."
                        )
                    )
                )
            )
        );
    }

    onClick(arg) {
        const self = this;
        switch (arg) {
            case "update":
                self.updateCss();
                break;
            case "save":
                self.saveCss();
                break;
            case "detach":
                self.detach();
                break;
        }
    }

    onChange(id, checked) {
        switch (id) {
            case "live-update":
                settingsCookie["bda-css-0"] = checked;
                Settings.saveSettings();
                break;
        }
    }

    updateCss() {
        DOM.removeStyle("customcss");
        DOM.addStyle("customcss", this.editor.session.getValue());
    }

    saveCss() {
        DataStore.setBDData("bdcustomcss", btoa(this.editor.session.getValue()));
    }

    detach() {
        const self = this;
        self.setState({
            detached: true
        });
        const droot = self.detachedRoot;
        if (!droot) {
            console.log("FAILED TO INJECT ROOT: .app");
            return;
        }
        BDV2.reactDom.render(self.detachedEditor, droot);
    }

    get detachedRoot() {
        const _root = DOM.query("#bd-customcss-detach-container");
        if (!_root) {
            if (!this.injectDetachedRoot()) return null;
            return this.detachedRoot;
        }
        return _root;
    }

    injectDetachedRoot() {
        const app = DOM.query(".app, .app-2rEoOp");
        if (!app) return false;
        DOM.insertAfter(DOM.createElement(`<div id="bd-customcss-detach-container">`), app);
        return true;
    }

    attach() {
        const self = this;
        self.setState({
            detached: false
        });
    }
}