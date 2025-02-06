import * as Filters from "./filter";
import {getAllModules, getModule} from "./get-module";

export function getByKeys<T>(keys: string[], options: Webpack.Options = {}) {
    return getModule<T>(Filters.byKeys(keys), options);
}
export function getAllByKeys<T extends any[]>(keys: string[], options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.byKeys(keys), options);
}

export function getByPrototypes<T>(prototypes: string[], options: Webpack.Options = {}) {
    return getModule<T>(Filters.byPrototypeKeys(prototypes), options);
}
export function getAllByPrototypes<T extends any[]>(prototypes: string[], options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.byPrototypeKeys(prototypes), options);
}

export function getByStrings<T>(strings: string[], options: Webpack.Options = {}) {
    return getModule<T>(Filters.byStrings(...strings), options);
}
export function getAllByStrings<T extends any[]>(strings: string[], options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.byStrings(...strings), options);
}

export function getByRegex<T>(regex: RegExp, options: Webpack.Options = {}) {
    return getModule<T>(Filters.byRegex(regex), options);
}
export function getAllByRegex<T extends any[]>(regex: RegExp, options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.byRegex(regex), options);
}

export function getBySource<T>(sources: Array<string | RegExp>, options: Webpack.Options = {}) {
    return getModule<T>(Filters.bySource(...sources), options);
}
export function getAllBySource<T extends any[]>(sources: Array<string | RegExp>, options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.bySource(...sources), options);
}

export function getByDisplayName<T>(name: string, options: Webpack.Options = {}) {
    return getModule<T>(Filters.byDisplayName(name), options);
}
export function getAllByDisplayName<T extends any[]>(name: string, options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.byDisplayName(name), options);
}