import {BDV2, DataStore, React, ReactDOM, Settings} from "modules";

import Checkbox from "./checkbox";
import SettingsTitle from "../settings/title";

export default class CssEditor extends React.Component {

    constructor(props) {
        super(props);
        this.props.lines = 0;
        this.state = {
            detached: this.props.detached || BDV2.editorDetached
        };
        // this.attach = this.attach.bind(this);
        // this.detachedEditor = React.createElement(EditorDetached, {attach: this.attach});
        this.onClick = this.onClick.bind(this);
        this.updateCss = this.updateCss.bind(this);
        this.saveCss = this.saveCss.bind(this);
        this.detach = this.detach.bind(this);
    }

    componentDidMount() {
        // this.updateLineCount();
        this.editor = ace.edit("bd-customcss-editor");
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

    componentDidUpdate(prevProps, prevState) {
        if (prevState.detached && !this.state.detached) {
            ReactDOM.unmountComponentAtNode(this.detachedRoot);
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
        return React.createElement(
            "div",
            {className: "contentColumn-2hrIYH contentColumnDefault-1VQkGM content-column default", style: {padding: "60px 40px 0px"}},
            // detached && React.createElement(
            //     "div",
            //     {id: "editor-detached"},
            //     React.createElement(SettingsTitle, {text: "Custom CSS Editor"}),
            //     React.createElement(
            //         "h3",
            //         null,
            //         "Editor Detached"
            //     ),
            //     React.createElement(
            //         "button",
            //         {className: "btn btn-primary", onClick: () => {
            //                 self.attach();
            //             }},
            //         "Attach"
            //     )
            // ),
            /*!detached && */React.createElement(
                "div",
                null,
                React.createElement(SettingsTitle, {text: "Custom CSS Editor"}),
                React.createElement("div", {className: "editor-wrapper"},
                    React.createElement("div", {id: "bd-customcss-editor", className: "editor", ref: "editor"}, self.css)
                ),
                React.createElement(
                    "div",
                    {id: "bd-customcss-attach-controls"},
                    React.createElement(
                        "ul",
                        {className: "checkbox-group"},
                        React.createElement(Checkbox, {id: "live-update", text: "Live Update", onChange: this.onChange, checked: Settings.get("settings", "customcss", "liveUpdate")})
                    ),
                    React.createElement(
                        "div",
                        {id: "bd-customcss-detach-controls-button"},
                        React.createElement(
                            "button",
                            {style: {borderRadius: "3px 0 0 3px", borderRight: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("update");
                                }},
                            "Update"
                        ),
                        React.createElement(
                            "button",
                            {style: {borderRadius: "0", borderLeft: "1px solid #2d2d2d", borderRight: "1px solid #2d2d2d"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("save");
                                }},
                            "Save"
                        ),
                        React.createElement(
                            "button",
                            {style: {borderRadius: "0 3px 3px 0", borderLeft: "1px solid #3f4146"}, className: "btn btn-primary", onClick: () => {
                                    self.onClick("detach");
                                }},
                            "Detach"
                        ),
                        React.createElement(
                            "span",
                            {style: {fontSize: "10px", marginLeft: "5px"}},
                            "Unsaved changes are lost on detach"
                        ),
                        React.createElement("div", {className: "help-text"},
                            "Press ",
                            React.createElement("code", {className: "inline"}, "ctrl"),
                            "+",
                            React.createElement("span", {className: "inline"}, ","),
                            " with the editor focused to access the editor's settings."
                        )
                    )
                )
            )
        );
    }

    onClick(arg) {
        switch (arg) {
            case "update":
                this.updateCss();
                break;
            case "save":
                this.saveCss();
                break;
            case "detach":
                this.detach();
                break;
        }
    }

    onChange(id, checked) {
        switch (id) {
            case "live-update":
                Settings.set("settings", "customcss", "liveUpdate", checked);
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

    detach() {
        return console.log("DETACH");
        // this.setState({
        //     detached: true
        // });
        // const droot = this.detachedRoot;
        // if (!droot) {
            // console.log("FAILED TO INJECT ROOT: .app");
        //     return;
        // }
        // ReactDOM.render(this.detachedEditor, droot);
    }

    // get detachedRoot() {
    //     const _root = $("#bd-customcss-detach-container");
    //     if (!_root.length) {
    //         if (!this.injectDetachedRoot()) return null;
    //         return this.detachedRoot;
    //     }
    //     return _root[0];
    // }

    // injectDetachedRoot() {
    //     if (!$(".app, .app-2rEoOp").length) return false;
    //     $("<div/>", {
    //         id: "bd-customcss-detach-container"
    //     }).insertAfter($(".app, .app-2rEoOp"));
    //     return true;
    // }

    // attach() {
    //     this.setState({
    //         detached: false
    //     });
    // }
}