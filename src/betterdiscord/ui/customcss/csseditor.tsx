import React from "@modules/react";
import {t} from "@common/i18n";
import Events from "@modules/emitter";
import Settings from "@stores/settings";

import Editor from "./editor";

import {RotateCwIcon, SaveIcon, PencilIcon, ExternalLinkIcon} from "lucide-react";


const {useState, useCallback, useEffect, forwardRef, useImperativeHandle, useRef} = React;

// TODO: let doggy do these types
export default forwardRef(function CssEditor({css, openNative, update, save, onChange: notifyParent, readOnly = false, id = "bd-customcss-editor", openDetached = false}, ref) {
    const editorRef = useRef(null);
    const [hasUnsavedChanges, setUnsaved] = useState(false);

    const updateEditor = useCallback((newCSS) => {
        editorRef.current.value = newCSS;
    }, [editorRef]);

    useImperativeHandle(ref, () => {
        return {
            resize() {editorRef.current.resize();},
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
            {label: <RotateCwIcon size="18px" />, tooltip: t("CustomCSS.update"), onClick: updateCss},
            {label: <SaveIcon size="18px" />, tooltip: t("CustomCSS.save"), onClick: saveCss},
            {label: <PencilIcon size="18px" />, tooltip: t("CustomCSS.openNative"), onClick: popoutNative},
            {label: t("Collections.settings.customcss.liveUpdate.name"), type: "boolean", onChange: toggleLiveUpdate, checked: Settings.get("settings", "customcss", "liveUpdate"), side: "right"},
            openDetached && {label: <ExternalLinkIcon size="18px" />, tooltip: t("CustomCSS.openDetached"), onClick: popout, side: "right"}
        ].filter(c => c)}
        value={css}
    />;
});