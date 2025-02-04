import React from "@modules/react";
import Strings from "@modules/strings";

import Editor from "@ui/customcss/editor";

import {RotateCwIcon, SaveIcon} from "lucide-react";

const {useState, useCallback, forwardRef, useImperativeHandle, useRef} = React;


export default forwardRef(function AddonEditor({content, language, save, openNative, id = "bd-addon-editor"}, ref) {
    const editorRef = useRef(null);
    const [hasUnsavedChanges, setUnsaved] = useState(false);

    useImperativeHandle(ref, () => {
        return {
            resize() {editorRef.current.resize();},
            showSettings() {editorRef.current.showSettings();},
            get value() {return editorRef.current.getValue();},
            set value(newValue) {editorRef.current.setValue(newValue);},
            get hasUnsavedChanges() {return hasUnsavedChanges;}
        };
    }, [hasUnsavedChanges]);

    const popoutNative = useCallback(() => openNative?.(), [openNative]);
    const onChange = useCallback(() => setUnsaved(true), []);
    const saveAddon = useCallback((event, newCSS) => {
        save?.(newCSS);
        setUnsaved(false);
    }, [save]);

    return <Editor
                ref={editorRef}
                language={language}
                id={id}
                controls={[
                    {label: <SaveIcon size="18px" />, tooltip: Strings.CustomCSS.save, onClick: saveAddon},
                    {label: <RotateCwIcon size="18px" />, tooltip: Strings.CustomCSS.openNative, onClick: popoutNative}
                ]}
                value={content}
                onChange={onChange}
            />;
});