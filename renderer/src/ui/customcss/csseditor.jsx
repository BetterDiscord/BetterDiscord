import React from "@modules/react";
import Strings from "@modules/strings";
import Events from "@modules/emitter";
import Settings from "@modules/settingsmanager";

import Editor from "./editor";

import Refresh from "@ui/icons/reload";
import Save from "@ui/icons/save";
import Edit from "@ui/icons/edit";
import Detach from "@ui/icons/detach";

const {useState, useCallback, useEffect, forwardRef, useImperativeHandle, useRef} = React;


export default forwardRef(function CssEditor({css, openNative, update, save, onChange: notifyParent, readOnly = false, id = "bd-customcss-editor", openDetached = false}, ref) {
    const editorRef = useRef(null);
    const [hasUnsavedChanges, setUnsaved] = useState(false);

    const updateEditor = useCallback((newCSS) => {
        editorRef.current.value = newCSS;
    }, [editorRef]);

    useImperativeHandle(ref, () => {
        return {
            resize() {editorRef.current.resize();},
            showSettings() {editorRef.current.showSettings();},
            get value() {return editorRef.current.getValue();},
            set value(newValue) {editorRef.current.setValue(newValue);},
            get hasUnsavedChanges() {return hasUnsavedChanges;}
        };
    }, [hasUnsavedChanges]);

    useEffect(() => {
        Events.on("customcss-updated", updateEditor);
        return () => Events.off("customcss-updated", updateEditor);
    }, [updateEditor]);

    const toggleLiveUpdate = useCallback((checked) => Settings.set("settings", "customcss", "liveUpdate", checked), []);
    const updateCss = useCallback((event, newCSS) => update?.(newCSS), [update]);
    const popoutNative = useCallback(() => openNative?.(), [openNative]);
    const popout = useCallback((event, currentCSS) => openDetached?.(currentCSS), [openDetached]);

    const onChange = useCallback((newCSS) => {
        notifyParent?.(newCSS);
        setUnsaved(true);
    }, [notifyParent]);

    const saveCss = useCallback((event, newCSS) => {
        save?.(newCSS);
        setUnsaved(false);
    }, [save]);
    

    return <Editor
                ref={editorRef}
                readOnly={readOnly}
                id={id}
                onChange={onChange}
                controls={[
                    {label: <Refresh size="18px" />, tooltip: Strings.CustomCSS.update, onClick: updateCss},
                    {label: <Save size="18px" />, tooltip: Strings.CustomCSS.save, onClick: saveCss},
                    {label: <Edit size="18px" />, tooltip: Strings.CustomCSS.openNative, onClick: popoutNative},
                    {label: Strings.Collections.settings.customcss.liveUpdate.name, type: "checkbox", onChange: toggleLiveUpdate, checked: Settings.get("settings", "customcss", "liveUpdate"), side: "right"},
                    openDetached && {label: <Detach size="18px" />, tooltip: Strings.CustomCSS.openDetached, onClick: popout, side: "right"}
                ].filter(c => c)}
                value={css}
            />;
});