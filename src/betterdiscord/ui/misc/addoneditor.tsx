import React from "react";
import {t} from "@common/i18n";

import Editor, {type Control, type EditorRef} from "@ui/customcss/editor";

import {ExternalLinkIcon, PencilIcon, SaveIcon} from "lucide-react";

const {useState, useCallback, useImperativeHandle, useRef} = React;


interface Props {
    content: string;
    language: string;
    save: (c: string) => void;
    openNative: () => void;
    id?: string;
    openDetached?(): void;
    ref: React.Ref<{
        resize(): void;
        value: string | undefined;
        hasUnsavedChanges: boolean;
    }>;
}

export default function AddonEditor({content, language, save, openNative, id = "bd-addon-editor", openDetached, ref}: Props) {
    const editorRef = useRef<EditorRef>(null);
    const [hasUnsavedChanges, setUnsaved] = useState(false);

    useImperativeHandle(ref, () => {
        return {
            resize() {editorRef.current?.resize();},
            get value(): string | undefined {return editorRef.current?.value ?? "";},
            set value(newValue: string) {if (editorRef.current) editorRef.current!.value = newValue;},
            get hasUnsavedChanges() {return hasUnsavedChanges;}
        };
    }, [hasUnsavedChanges]);

    const popoutNative = useCallback(() => openNative?.(), [openNative]);
    const onChange = useCallback(() => setUnsaved(true), []);
    const saveAddon = useCallback((_: React.MouseEvent, newCSS: string) => {
        save?.(newCSS);
        setUnsaved(false);
    }, [save]);

    return <Editor
        ref={editorRef}
        language={language}
        id={id}
        controls={[
            {label: <SaveIcon size="18px" />, tooltip: t("CustomCSS.save"), onClick: saveAddon},
            {label: <PencilIcon size="18px" />, tooltip: t("CustomCSS.openNative"), onClick: popoutNative},
            openDetached && {label: <ExternalLinkIcon size="18px" />, tooltip: t("CustomCSS.openDetached"), onClick: openDetached, side: "right"}
        ].filter(x => x) as Control[]}
        value={content}
        onChange={onChange}
    />;
};