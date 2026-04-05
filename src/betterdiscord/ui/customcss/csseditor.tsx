import React from "@modules/react";
import {t} from "@common/i18n";
import Events from "@modules/emitter";
import Settings from "@stores/settings";

import Editor, {type Control, type EditorRef} from "./editor";

import {RotateCwIcon, SaveIcon, PencilIcon, ExternalLinkIcon} from "lucide-react";


const {useState, useCallback, useEffect, forwardRef, useImperativeHandle, useRef} = React;

interface CssEditorProps {
    css: string;
    openNative: () => void;
    update: (css: string) => void;
    save: (css: string) => void;
    onChange: (css: string) => void;
    openDetached?: (css: string) => void;
    readOnly?: boolean;
    id?: string;
}

export interface CssEditorRef {
    resize: () => void;
    value: string;
    hasUnsavedChanges: boolean;
}

export default forwardRef(function CssEditor({
    css,
    openNative,
    update,
    save,
    openDetached,
    onChange: notifyParent,
    id = "bd-customcss-editor",
}: CssEditorProps, ref) {
    const editorRef = useRef<EditorRef>(null);
    const [hasUnsavedChanges, setUnsaved] = useState(false);

    const updateEditor = useCallback((newCSS: string) => {
        if (!editorRef.current) return;
        editorRef.current.value = newCSS;
    }, [editorRef]);

    useImperativeHandle(ref, () => {
        return {
            resize() {editorRef.current?.resize();},
            get value() {return editorRef.current!.value;},
            set value(newValue) {editorRef.current!.value = newValue;},
            get hasUnsavedChanges() {return hasUnsavedChanges;}
        };
    }, [hasUnsavedChanges]);

    useEffect(() => {
        Events.on("customcss-updated", updateEditor);
        return () => void Events.off("customcss-updated", updateEditor);
    }, [updateEditor]);

    const toggleLiveUpdate = useCallback((checked: boolean) => Settings.set("settings", "customcss", "liveUpdate", checked), []);
    const updateCss = useCallback((_: React.MouseEvent, newCSS: string) => update?.(newCSS), [update]);
    const popoutNative = useCallback(() => openNative?.(), [openNative]);
    const popout = useCallback((_: React.MouseEvent, currentCSS: string) => openDetached?.(currentCSS), [openDetached]);

    const onChange = useCallback((newCSS: string) => {
        notifyParent?.(newCSS);
        setUnsaved(true);
    }, [notifyParent]);

    const saveCss = useCallback((_: React.MouseEvent, newCSS: string) => {
        save?.(newCSS);
        setUnsaved(false);
    }, [save]);


    return <Editor
        ref={editorRef}
        id={id}
        onChange={onChange}
        controls={[
            {label: <RotateCwIcon size="18px" />, tooltip: t("CustomCSS.update"), onClick: updateCss},
            {label: <SaveIcon size="18px" />, tooltip: t("CustomCSS.save"), onClick: saveCss},
            {label: <PencilIcon size="18px" />, tooltip: t("CustomCSS.openNative"), onClick: popoutNative},
            {label: t("Collections.settings.customcss.liveUpdate.name"), type: "boolean", onChange: toggleLiveUpdate, checked: Settings.get("settings", "customcss", "liveUpdate"), side: "right"},
            openDetached && {label: <ExternalLinkIcon size="18px" />, tooltip: t("CustomCSS.openDetached"), onClick: popout, side: "right"}
        ].filter(c => c) as Control[]}
        value={css}
    />;
});