import React from "@modules/react";

import Button from "../base/button";
import type {MouseEvent, PropsWithChildren} from "react";
import {portal, useInModalSettings} from "@ui/settings";
import clsx from "clsx";

const {useCallback} = React;

export type SettingsTitleProps = PropsWithChildren<{
    isGroup?: boolean;
    className?: string;
    button?: {title: string; onClick(e: MouseEvent): void;};
    onClick?(): void;
    text?: string;
    _isSettingsTitle?: boolean;
}>;

export default function SettingsTitle({isGroup = false, className = "", button = undefined, onClick = undefined, text, children = [], _isSettingsTitle}: SettingsTitleProps) {
    const inModalSettings = useInModalSettings() && _isSettingsTitle;

    const click = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        button?.onClick?.(event);
    }, [button]);


    const node = (
        <h2 className={clsx("bd-settings-title", isGroup && "bd-settings-group-title", className)} data-in-modal-settings={inModalSettings} onClick={() => {onClick?.();}}>
            {text}
            {button && <Button className="bd-button-title" onClick={click} size={Button.Sizes.NONE}>{button.title}</Button>}
            {children}
        </h2>
    );

    if (inModalSettings) return portal(node);

    return node;
}