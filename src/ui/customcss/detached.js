import {SettingsCookie} from "data";
import {BDV2, DataStore, Core, DiscordModules} from "modules";

import Checkbox from "../settings/checkbox";

export default class V2C_CssEditorDetached extends DiscordModules.React.Component {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.updateCss = this.updateCss.bind(this);
        this.saveCss = this.saveCss.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    componentDidMount() {
        $("#app-mount").addClass("bd-detached-editor");
        BDV2.editorDetached = true;
        // this.updateLineCount();
        this.editor = ace.edit("bd-customcss-editor-detached");
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode("ace/mode/css");
        this.editor.setShowPrintMargin(false);
        this.editor.setFontSize(14);
        this.editor.on("change", () => {
            if (!SettingsCookie["bda-css-0"]) return;
            this.saveCss();
            this.updateCss();
        });

    }

    componentWillUnmount() {
        $("#app-mount").removeClass("bd-detached-editor");
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
        const _root = $("#bd-customcss-detach-container");
        if (!_root.length) {
            if (!this.injectRoot()) return null;
            return this.detachedRoot;
        }
        return _root[0];
    }

    injectRoot() {
        if (!$(".app, .app-2rEoOp").length) return false;
        $("<div/>", {
            id: "bd-customcss-detach-container"
        }).insertAfter($(".app, .app-2rEoOp"));
        return true;
    }

    render() {
        const self = this;
        return DiscordModules.React.createElement(
            "div",
            {className: "bd-detached-css-editor", id: "bd-customcss-detach-editor"},
            DiscordModules.React.createElement(
                "div",
                {id: "bd-customcss-innerpane"},
                DiscordModules.React.createElement("div", {className: "editor-wrapper"},
                    DiscordModules.React.createElement("div", {id: "bd-customcss-editor-detached", className: "editor", ref: "editor"}, self.css)
                ),
                DiscordModules.React.createElement(
                    "div",
                    {id: "bd-customcss-attach-controls"},
                    DiscordModules.React.createElement(
                        "ul",
                        {className: "checkbox-group"},
                        DiscordModules.React.createElement(Checkbox, {id: "live-update", text: "Live Update", onChange: self.onChange, checked: SettingsCookie["bda-css-0"]})
                    ),
                    DiscordModules.React.createElement(
                        "div",
                        {id: "bd-customcss-detach-controls-button"},
                        DiscordModules.React.createElement(
                            "button",
                            {style: {borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                }},
                            "Update"
                        ),
                        DiscordModules.React.createElement(
                            "button",
                            {style: {borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                }},
                            "Save"
                        ),
                        DiscordModules.React.createElement(
                            "button",
                            {style: {borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("attach");
                                }},
                            "Attach"
                        ),
                        DiscordModules.React.createElement(
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
                SettingsCookie["bda-css-0"] = checked;
                Core.saveSettings();
                break;
        }
    }

    onClick(id) {
        const self = this;
        switch (id) {
            case "attach":
                if ($("#editor-detached").length) self.props.attach();
                DiscordModules.ReactDOM.unmountComponentAtNode(self.root);
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
        if ($("#customcss").length == 0) {
            $("head").append("<style id=\"customcss\"></style>");
        }
        $("#customcss").text(this.editor.session.getValue()).detach().appendTo(document.head);
    }

    saveCss() {
        DataStore.setBDData("bdcustomcss", btoa(this.editor.session.getValue()));
    }
}