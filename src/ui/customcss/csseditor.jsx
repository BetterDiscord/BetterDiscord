import {React, Settings} from "modules";

import Editor from "./editor";
// import Checkbox from "./checkbox";

export default class CssEditor extends React.Component {

    constructor(props) {
        super(props);

        this.toggleLiveUpdate = this.toggleLiveUpdate.bind(this);
        this.updateCss = this.updateCss.bind(this);
        this.saveCss = this.saveCss.bind(this);
        this.openDetached = this.props.openDetached ? this.openDetached.bind(this) : null;
        this.openNative = this.openNative.bind(this);

        this.checkboxes = [{label: "Live Update", onChange: this.toggleLiveUpdate, checked: Settings.get("settings", "customcss", "liveUpdate")}];
        this.buttons = [
            {label: "Update", onClick: this.updateCss},
            {label: "Save", onClick: this.saveCss},
            {label: "Open Natively", onClick: this.openNative},
            {label: "Settings", onClick: "showSettings"}
        ];
        if (this.openDetached) this.buttons.push({label: "Detach", onClick: this.openDetached});
        this.notice = this.openDetached ? "Unsaved changes are lost on detach" : null;
    }

    render() {
        return <Editor id={this.props.id || "bd-customcss-editor"} notice={this.openDetached ? this.notice : null} checkboxes={this.checkboxes} buttons={this.buttons} showHelp={true} value={this.props.css} />;
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