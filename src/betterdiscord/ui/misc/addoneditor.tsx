import React from "@modules/react";
import {t} from "@common/i18n";

import Editor from "@ui/customcss/editor";

import {RotateCwIcon, SaveIcon} from "lucide-react";

const {useState, useCallback, forwardRef, useImperativeHandle, useRef} = React;


interface Props {
    content: string;
    language: string;
    save: (c: string) => void;
    openNative: () => void;
    id?: string;
}

export default forwardRef(function AddonEditor({content, language, save, openNative, id = "bd-addon-editor"}: Props, ref) {
    const editorRef = useRef<{resize(): void; getValue(): string; setValue(s: string): void;}>(null);
    const [hasUnsavedChanges, setUnsaved] = useState(false);

    useImperativeHandle(ref, () => {
        return {
            resize() {editorRef.current?.resize();},
            get value(): string | undefined {return editorRef.current?.getValue();},
            set value(newValue: string) {editorRef.current?.setValue(newValue);},
            get hasUnsavedChanges() {return hasUnsavedChanges;}
        };
    }, [hasUnsavedChanges]);

    const popoutNative = useCallback(() => openNative?.(), [openNative]);
    const onChange = useCallback(() => setUnsaved(true), []);
    const saveAddon = useCallback((_: any, newCSS: string) => {
        save?.(newCSS);
        setUnsaved(false);
    }, [save]);

    return <Editor
        ref={editorRef}
        language={language}
        id={id}
        controls={[
            {label: <SaveIcon size="18px" />, tooltip: t("CustomCSS.save"), onClick: saveAddon},
            {label: <RotateCwIcon size="18px" />, tooltip: t("CustomCSS.openNative"), onClick: popoutNative}
        ]}
        value={content}
        onChange={onChange}
    />;
});