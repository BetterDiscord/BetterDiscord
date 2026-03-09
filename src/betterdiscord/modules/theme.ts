import type {AddonBase} from "./addonbase";

export interface Theme extends AddonBase {
    css: string;
    properties?: Record<string, Record<string, string | boolean>>;
}