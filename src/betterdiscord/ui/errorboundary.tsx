import React, {type CSSProperties, type PropsWithChildren, type ReactNode} from "react";
import Logger from "@common/logger";
import Fallback from "@ui/errorboundary/fallback";
import MiniFallback from "@ui/errorboundary/minifallback";
import SmallFallback from "@ui/errorboundary/smallfallback";


export const ErrorBoundarySizes = Object.freeze({
    FULL: "full",
    SMALL: "small",
    MINI: "mini"
});

export const ErrorBoundaryButtons = Object.freeze({
    COPY_ERROR: "copy-error",
    TRY_AGAIN: "try-again"
});

export type ErrorBoundaryProps = PropsWithChildren<{
    /** An optional id for debugging purposes, shown in the log and the error details */
    id?: string;
    /** An optional name for debugging purposes, also shown in the error message (e.g. the plugin name) */
    name?: string;
    /** Whether to hide the default error message in the ui (never shown if there is a fallback) */
    hideError?: boolean;
    /** A fallback to show on error */
    fallback?: ReactNode;
    /** A callback called with the error when it happens */
    onError?(e: Error): void;
    /**
     * How big the default error should be. Defaults to `ErrorBoundary.Sizes.FULL`.
     * - `FULL`: the error card with the details and buttons.
     * - `SMALL`: an icon with a short text, e.g. in tooltips.
     * - `MINI`: only an icon, e.g. next to text.
     */
    size?: typeof ErrorBoundarySizes[keyof typeof ErrorBoundarySizes];
    /** Shows the first stack frames below the error message. Defaults to `true`. */
    showStackTrace?: boolean;
    /**
     * Which buttons the error card shows. Defaults to `true`.
     * - `true`: all buttons.
     * - `false`: no buttons.
     * - An `ErrorBoundary.Buttons` value: only that button.
     */
    showButtons?: boolean | typeof ErrorBoundaryButtons[keyof typeof ErrorBoundaryButtons];
    /** Styles applied to the default error */
    style?: CSSProperties;
}>;

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    static Sizes = ErrorBoundarySizes;
    static Buttons = ErrorBoundaryButtons;

    /**
     * Creates an error boundary with optional fallbacks and debug info.
     * @param props
     */
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {hasError: false, error: null};
        this.retry = this.retry.bind(this);
    }

    componentDidCatch(error: Error) {
        this.setState({hasError: true, error});
        Logger.stacktrace("ErrorBoundary", `React error detected for {name: ${this.props.name ?? "Unknown"}, id: ${this.props.id ?? "Unknown"}}`, error);
        if (typeof this.props.onError === "function") this.props.onError(error);
    }

    /** Clears the error so the children get mounted again. */
    retry() {
        this.setState({hasError: false, error: null});
    }

    render() {
        if (!this.state.hasError) return this.props.children;
        if (this.props.fallback) return this.props.fallback;
        if (this.props.hideError) return null;

        const {id, name, size = ErrorBoundarySizes.FULL, showStackTrace = true, showButtons = true, style} = this.props;
        if (size === ErrorBoundarySizes.MINI) return <MiniFallback name={name} style={style} />;
        if (size === ErrorBoundarySizes.SMALL) return <SmallFallback name={name} style={style} />;
        return <Fallback
            id={id}
            name={name}
            error={this.state.error}
            showStackTrace={showStackTrace}
            showCopy={showButtons === true || showButtons === ErrorBoundaryButtons.COPY_ERROR}
            showRetry={showButtons === true || showButtons === ErrorBoundaryButtons.TRY_AGAIN}
            onRetry={this.retry}
            style={style}
        />;
    }
}

const originalRender = ErrorBoundary.prototype.render;
Object.defineProperty(ErrorBoundary.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function () {Logger.warn("ErrorBoundary", "Addon policy for plugins https://docs.betterdiscord.app/plugins/publishing/guidelines#scope");},
    get: () => originalRender
});
