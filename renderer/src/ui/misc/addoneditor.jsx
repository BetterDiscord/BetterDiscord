import {React, Strings} from "modules";

import Editor from "../customcss/editor";
import Save from "../icons/save";
import Edit from "../icons/edit";

export default class AddonEditor extends React.Component {

    constructor(props) {
        super(props);

        this.hasUnsavedChanges = false;
        this.onChange = this.onChange.bind(this);
        this.save = this.save.bind(this);
        this.openNative = this.openNative.bind(this);
        this.update = this.update.bind(this);

        this.controls = [
            {label: React.createElement(Save, {size: "18px"}), tooltip: Strings.CustomCSS.save, onClick: this.save},
            {label: React.createElement(Edit, {size: "18px"}), tooltip: Strings.CustomCSS.openNative, onClick: this.openNative}
        ];
    }

    update() {
        this.forceUpdate();
    }

    updateEditor(newCSS) {
        if (!this.editor) return;
        this.editor.value = newCSS;
    }

    get value() {return this.editor.session.getValue();}
    set value(newValue) {
        this.editor.setValue(newValue);
    }

    showSettings() {return this.editor.keyBinding.$defaultHandler.commands.showSettingsMenu.exec(this.editor);}
    resize() {return this.editor.resize();}

    setEditorRef(editor) {
        this.editor = editor;
        if (this.props.editorRef && typeof(this.props.editorRef.current) !== "undefined") this.props.editorRef.current = editor;
        else if (this.props.editorRef) this.props.editorRef = editor;
    }

    render() {
        return <Editor ref={this.setEditorRef.bind(this)} language={this.props.language} id={this.props.id || "bd-addon-editor"} controls={this.controls} value={this.props.content} onChange={this.onChange} />;
    }

    onChange() {
        this.hasUnsavedChanges = true;
    }

    save(event, content) {
        this.hasUnsavedChanges = false;
        if (this.props.save) this.props.save(content);
    }

    openNative() {
        if (this.props.openNative) this.props.openNative();
    }
}