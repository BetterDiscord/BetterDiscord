import React, {type MouseEvent, type PropsWithChildren} from "react";

import Button from "../base/button";

const {useCallback} = React;


const basicClass = "bd-settings-title";
const groupClass = "bd-settings-title bd-settings-group-title";

export type SettingsTitleProps = PropsWithChildren<{
    isGroup?: boolean;
    className?: string;
    button?: {title: string; onClick(e: MouseEvent): void;};
    onClick?(): void;
    text?: React.ReactNode;
}>;

export default function SettingsTitle({isGroup = false, className = "", button = undefined, onClick = undefined, text, children = []}: SettingsTitleProps) {
    const click = useCallback((event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
        button?.onClick?.(event);
    }, [button]);


    const baseClass = isGroup ? groupClass : basicClass;
    const titleClass = className ? `${baseClass} ${className}` : baseClass;
    return <h2 className={titleClass} onClick={() => {onClick?.();}}>
        {text}
        {button && <Button className="bd-button-title" onClick={click} size={Button.Sizes.NONE}>{button.title}</Button>}
        {children}
    </h2>;

}