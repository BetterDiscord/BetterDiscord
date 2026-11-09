import clsx from "clsx";
import React from "react";
import {t} from "@common/i18n";


const SYMBOLS: Record<string, string> = Object.freeze({
    "⌘": "command",
    "⌥": "option",
    "⇧": "shift",
    "⌃": "control"
});

export interface KeyboardShortcutProps {
    keys: string[];
    className?: string;
}

export default function KeyboardShortcut({keys, className}: KeyboardShortcutProps) {
    return <kbd className={clsx("bd-keyboard-shortcut", className)}>
        {keys.map(key => (
            <kbd key={key}>
                {SYMBOLS[key]
                    ? <span className="bd-keyboard-shortcut-symbol" role="img" aria-label={t(`KeyboardShortcut.${SYMBOLS[key]}`)}>{key}</span>
                    : key}
            </kbd>
        ))}
    </kbd>;
}
