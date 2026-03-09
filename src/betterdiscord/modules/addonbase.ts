import type {AddonMeta} from "./addonmeta";

/**
 * This is an abstract interface used for Plugin, Theme and similar direct types.
 *
 * Never use this type, consider using types from 'addon.ts' such as `AddonAny` instead.
 */
export interface AddonBase extends AddonMeta {
    added: number;
    donate?: string;
    fileContent?: string;
    filename: string;
    format: string;
    id: string;
    modified: number;
    partial?: boolean;
    patreon?: string;
    size: number;
    slug: string;
}
