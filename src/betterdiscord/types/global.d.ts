import {DiscordNativeAPI} from "./discord/native";


interface DiscordWindow {
    webpackChunkdiscord_app: Array<Webpack.ModuleWithoutEffect | Webpack.ModuleWithEffect>;
    DiscordNative: DiscordNativeAPI;
    monaco: any; // TODO: proper typing when maybe bundling monaco

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
}

declare global {
    const DiscordNative: DiscordNativeAPI;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Window extends DiscordWindow {};
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Window extends DiscordWindow {};