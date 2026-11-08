import React from "react";
import {t} from "@common/i18n";
import IPC from "@modules/ipc";
import Config from "@stores/config";
import Settings from "@stores/settings";
import Button from "@ui/base/button";
import Text from "@ui/base/text";
import Keybind, {CONSOLE_KEYS} from "@ui/errorboundary/keybind";
import {useStateFromStores} from "@ui/hooks";
import type {ErrorBoundaryProps} from "@ui/errorboundary";

const {useEffect, useState} = React;


interface FallbackProps extends Pick<ErrorBoundaryProps, "id" | "name" | "showStackTrace" | "style"> {
    error: Error | null;
    showCopy: boolean;
    showRetry: boolean;
    onRetry(): void;
}

const STACK_FRAMES = 2;
const KEYBIND_PLACEHOLDER = "{{keybind}}";

/**
 * @returns The error line and the first few stack frames with file names instead of full URLs,
 * e.g. `"Error: Something broke\n    at TestComponent (TestPlugin.plugin.js:12:34)"`.
 */
function getShortStack(error: unknown): string {
    if (!(error instanceof Error)) return String(error);

    const lines = error.stack?.split("\n") ?? [];
    const frames = lines
        .filter(line => line.trimStart().startsWith("at "))
        .slice(0, STACK_FRAMES)
        .map(line => line.replace(/[^\s()]*\/([^/\s()]+:\d+:\d+)/g, "$1"));
    return [`${error.name}: ${error.message}`, ...frames].join("\n");
}

function Description({name}: {name?: string;}) {
    const showKeybind = useStateFromStores(Settings, () => Settings.get<boolean>("settings", "developer", "devTools"), []);
    const context = showKeybind ? (name ? "namedKeybind" : "keybind") : (name ? "named" : undefined);
    const parts = t("ErrorBoundary.description", {context, name}).split(KEYBIND_PLACEHOLDER);

    return <>
        {parts[0]}
        {parts.length > 1 && <Keybind keys={CONSOLE_KEYS} />}
        {parts[1]}
    </>;
}

function CopyErrorButton({id, name, error}: {id?: string; name?: string; error: Error;}) {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const timeout = setTimeout(() => setCopied(false), 1000);
        return () => clearTimeout(timeout);
    }, [copied]);

    const copy = () => {
        DiscordNative?.clipboard?.copy([
            `${name ?? "Unknown"} (${id ?? "Unknown"})`,
            `BetterDiscord v${Config.get("version")}`,
            error.stack ?? String(error)
        ].join("\n"));
        setCopied(true);
    };

    return <Button size={Button.Sizes.SMALL} color={copied ? Button.Colors.GREEN : Button.Colors.PRIMARY} onClick={copy}>
        {t(copied ? "ErrorBoundary.copied" : "ErrorBoundary.copy")}
    </Button>;
}

export default function Fallback({id, name, error, showStackTrace, showCopy, showRetry, onRetry, style}: FallbackProps) {
    return <div className="bd-error-boundary" style={style} role="alert">
        <div className="bd-error-boundary-content">
            <Text tag="h3" size={Text.Sizes.SIZE_16} color={Text.Colors.HEADER_PRIMARY} strong={true}>
                {t("ErrorBoundary.title")}
            </Text>
            <Text tag="button" type="button" className="bd-error-boundary-description" color={Text.Colors.MUTED} onClick={() => IPC.openDevTools()}>
                <Description name={name} />
            </Text>
            {showStackTrace && error && <code className="bd-error-boundary-details">
                {id && `[${id}] `}{getShortStack(error)}
            </code>}
        </div>
        {(showCopy || showRetry) && <div className="bd-error-boundary-actions">
            {showCopy && error && <CopyErrorButton id={id} name={name} error={error} />}
            {showRetry && <Button size={Button.Sizes.SMALL} onClick={onRetry}>{t("ErrorBoundary.retry")}</Button>}
        </div>}
    </div>;
}
