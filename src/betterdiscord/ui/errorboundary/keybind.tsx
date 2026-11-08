import React from "react";
import {t} from "@common/i18n";


export interface Key {
    label: string;
    name?: "command" | "option";
}

export const CONSOLE_KEYS: Key[] = process.platform === "darwin"
    ? [{label: "⌘", name: "command"}, {label: "⌥", name: "option"}, {label: "I"}]
    : [{label: "Ctrl"}, {label: "Shift"}, {label: "I"}];

export default function Keybind({keys}: {keys: Key[];}) {
    return <span className="bd-error-boundary-keybind">
        {keys.map(({label, name}) => (
            <kbd key={label}>
                {name
                    ? <span className="bd-error-boundary-symbol" role="img" aria-label={t(`ErrorBoundary.keys.${name}`)}>{label}</span>
                    : label}
            </kbd>
        ))}
    </span>;
}
