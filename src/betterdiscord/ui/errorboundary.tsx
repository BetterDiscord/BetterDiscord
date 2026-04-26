import Logger from "@common/logger";
import React from "@modules/react";
import IPC from "@modules/ipc";
import type {PropsWithChildren, ReactNode} from "react";


export type ErrorBoundaryProps = PropsWithChildren<{
    /** An optional id for debugging purposes */
    id?: string;
    /** An optional name for debugging purposes */
    name?: string;
    /** Whether to hide the default error message in the ui (never shown if there is a fallback) */
    hideError?: boolean;
    /** A fallback to show on error */
    fallback?: ReactNode;
    /** A callback called with the error when it happens */
    onError?(e: Error): void;
}>;

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, {hasError: boolean;}> {
    /**
     * Creates an error boundary with optional fallbacks and debug info.
     * @param props
     */
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {hasError: false};
    }

    componentDidCatch(error: Error) {
        this.setState({hasError: true});
        Logger.stacktrace("ErrorBoundary", `React error detected for {name: ${this.props.name ?? "Unknown"}, id: ${this.props.id ?? "Unknown"}}`, error);
        if (typeof this.props.onError === "function") this.props.onError(error);
    }

    render() {
        if (this.state.hasError && this.props.fallback) {
            return this.props.fallback;
        }
        else if (this.state.hasError && !this.props.hideError) {
            return <div onClick={() => IPC.openDevTools()} className="react-error">
                There was an unexpected Error. Click to open console for more details.
            </div>;
        }
        return this.props.children;
    }
}

const originalRender = ErrorBoundary.prototype.render;
Object.defineProperty(ErrorBoundary.prototype, "render", {
    enumerable: false,
    configurable: false,
    set: function () {Logger.warn("ErrorBoundary", "Addon policy for plugins https://docs.betterdiscord.app/plugins/publishing/guidelines#scope");},
    get: () => originalRender
});
