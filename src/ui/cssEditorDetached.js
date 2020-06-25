import {settingsCookie} from "../0globals";
import Settings from "../modules/settingsPanel";
import BDV2 from "../modules/v2";
import DataStore from "../modules/dataStore";
import DOM from "../modules/domtools";

import Checkbox from "./checkbox";

export default class V2C_CssEditorDetached extends BDV2.reactComponent {

    constructor(props) {
        super(props);
        const self = this;
        self.onClick = self.onClick.bind(self);
        self.updateCss = self.updateCss.bind(self);
        self.saveCss = self.saveCss.bind(self);
        self.onChange = self.onChange.bind(self);
    }

    componentDidMount() {
        DOM.addClass(DOM.query("#app-mount"), "bd-detached-editor");
        BDV2.editorDetached = true;
        // this.updateLineCount();
        this.editor = ace.edit("bd-customcss-editor-detached");
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
        DOM.removeClass(DOM.query("#app-mount"), "bd-detached-editor");
        BDV2.editorDetached = false;
        this.editor.destroy();
    }

    updateLineCount() {
        const lineCount = this.refs.editor.value.split("\n").length;
        if (lineCount == this.props.lines) return;
        this.refs.lines.textContent = Array.from(new Array(lineCount), (_, i) => i + 1).join(".\n") + ".";
        this.props.lines = lineCount;
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

    get root() {
        const _root = DOM.query("#bd-customcss-detach-container");
        if (!_root) {
            if (!this.injectRoot()) return null;
            return this.detachedRoot;
        }
        return _root;
    }

    injectRoot() {
        const app = DOM.query(".app, .app-2rEoOp");
        if (!app) return false;
        DOM.insertAfter(DOM.createElement(`<div id="bd-customcss-detach-container">`), app);
        return true;
    }

    render() {
        const self = this;
        return BDV2.react.createElement(
            "div",
            {className: "bd-detached-css-editor", id: "bd-customcss-detach-editor"},
            BDV2.react.createElement(
                "div",
                {id: "bd-customcss-innerpane"},
                BDV2.react.createElement("div", {className: "editor-wrapper"},
                    BDV2.react.createElement("div", {id: "bd-customcss-editor-detached", className: "editor", ref: "editor"}, self.css)
                ),
                BDV2.react.createElement(
                    "div",
                    {id: "bd-customcss-attach-controls"},
                    BDV2.react.createElement(
                        "ul",
                        {className: "checkbox-group"},
                        BDV2.react.createElement(Checkbox, {id: "live-update", text: "Live Update", onChange: self.onChange, checked: settingsCookie["bda-css-0"]})
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
                                    self.onClick("attach");
                                }},
                            "Attach"
                        ),
                        BDV2.react.createElement(
                            "span",
                            {style: {fontSize: "10px", marginLeft: "5px"}},
                            "Unsaved changes are lost on attach"
                        )
                    )
                )
            )
        );
    }

    onChange(id, checked) {
        switch (id) {
            case "live-update":
                settingsCookie["bda-css-0"] = checked;
                Settings.saveSettings();
                break;
        }
    }

    onClick(id) {
        const self = this;
        switch (id) {
            case "attach":
                if (DOM.query("#editor-detached")) self.props.attach();
                BDV2.reactDom.unmountComponentAtNode(self.root);
                self.root.remove();
                break;
            case "update":
                self.updateCss();
                break;
            case "save":
                self.saveCss();
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
}