import type {Fiber} from "react-reconciler";
import {DiscordNativeAPI} from "./discord/native";
import * as PreloadAPI from "../../electron/preload/api/index";

interface DiscordWindow {
    webpackChunkdiscord_app: Array<Webpack.ModuleWithoutEffect | Webpack.ModuleWithEffect>;
    DiscordNative: DiscordNativeAPI;
    monaco: typeof import("monaco-editor");
    $type?: any; // From RDT

    __SENTRY__: {
        logger?: {disable(): void;};
        globalEventProcessors?: unknown[];
    };

    DiscordSentry: {
        getCurrentHub?(): {
            bindClient(): void;
            withScope(): void;
            getClient(): {close?(code: number): void;};
            getScope(): {clear?(): void, setFingerprint?(a: unknown): void;};
            getIsolationScope(): void;
            captureException(): void;
            captureMessage(): void;
            captureEvent(): void;
            addBreadcrumb(): void;
            setUser(u: unknown): void;
            setTags(t: object): void;
            setTag(): void;
            setExtra(): void;
            setExtras(e: object): void;
            setContext(): void;
            getIntegration(): void;
            startSession(): void;
            endSession(): void;
            captureSession(): void;
        };
    };

    BetterDiscordPreload(): typeof PreloadAPI;
}

declare global {
    const DiscordNative: DiscordNativeAPI;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Window extends DiscordWindow {};

    interface Node {
        __reactFiber$?: Fiber,
        __reactProps$?: any;
    }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Window extends DiscordWindow {};

