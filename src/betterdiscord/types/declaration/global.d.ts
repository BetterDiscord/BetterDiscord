import type {Fiber} from "react-reconciler";
import {DiscordNativeAPI} from "../discord/native";
import * as PreloadAPI from "../../../electron/preload/api/index";

declare global {
    interface Map<K, V> {
        /**
         * Returns a specified element from the Map object.
         * If no element is associated with the specified key, a new element with the value `defaultValue` will be inserted into the Map and returned.
         * @returns The element associated with the specified key, which will be `defaultValue` if no element previously existed.
         */
        getOrInsert(key: K, defaultValue: V): V;
        /**
         * Returns a specified element from the Map object.
         * If no element is associated with the specified key, the result of passing the specified key to the `callback` function will be inserted into the Map and returned.
         * @returns The element associated with the specific key, which will be the newly computed value if no element previously existed.
         */
        getOrInsertComputed(key: K, callback: (key: K) => V): V;
    }
}

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

    BetterDiscordRunRenderer(): void;

    GLOBAL_ENV?: {
        RELEASE_CHANNEL?: string;
    };
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