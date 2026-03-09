import type {AddonType} from "./addon";
import pluginmanager from "./pluginmanager";
import thememanager from "./thememanager";

export type ManagerFromType<T extends AddonType> = T extends "plugin" ? typeof pluginmanager : typeof thememanager;
export function managerFromType<T extends AddonType>(addonType: NoInfer<T>): ManagerFromType<T> {
    return (addonType === "plugin" ? pluginmanager : thememanager) as ManagerFromType<T>;
}