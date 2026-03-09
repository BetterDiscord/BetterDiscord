import type {AddonBase} from "./addonbase";
import type {AddonMeta} from "./addonmeta";

export interface PluginMeta extends AddonMeta {
    use: string[];
};

export interface Plugin extends AddonBase, PluginMeta {
    exports: any;
    instance: {
        load?(): void | Promise<void>;
        start(): void | Promise<void>;
        stop(): void | Promise<void>;
        observer?(m: MutationRecord): void | Promise<void>;
        getSettingsPanel?(): any | Promise<any>;
        onSwitch?(): void | Promise<void>;
    };
}