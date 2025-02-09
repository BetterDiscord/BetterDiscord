import type {Webpack} from "discord";
import * as Filters from "./filter";
import {getAllModules, getModule} from "./searching";
import {getLazy} from "./lazy";

export function getByKeys<T>(keys: string[], options: Webpack.Options = {}) {
    return getModule<T>(Filters.byKeys(keys), options);
}
export function getAllByKeys<T extends unknown[]>(keys: string[], options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.byKeys(keys), options);
}
export function getLazyByKeys<T>(keys: string[], options: Webpack.Options = {}) {
    return getLazy<T>(Filters.byKeys(keys), options);
}

export function getByPrototypes<T>(prototypes: string[], options: Webpack.Options = {}) {
    return getModule<T>(Filters.byPrototypeKeys(prototypes), options);
}
export function getAllByPrototypes<T extends unknown[]>(prototypes: string[], options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.byPrototypeKeys(prototypes), options);
}
export function getLazyByPrototypes<T>(prototypes: string[], options: Webpack.Options = {}) {
    return getLazy<T>(Filters.byPrototypeKeys(prototypes), options);
}

export function getByStrings<T>(strings: string[], options: Webpack.Options = {}) {
    return getModule<T>(Filters.byStrings(...strings), options);
}
export function getAllByStrings<T extends unknown[]>(strings: string[], options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.byStrings(...strings), options);
}
export function getLazyByStrings<T>(strings: string[], options: Webpack.Options = {}) {
    return getLazy<T>(Filters.byStrings(...strings), options);
}

export function getByRegex<T>(regex: RegExp, options: Webpack.Options = {}) {
    return getModule<T>(Filters.byRegex(regex), options);
}
export function getAllByRegex<T extends unknown[]>(regex: RegExp, options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.byRegex(regex), options);
}
export function getLazyByRegex<T>(regex: RegExp, options: Webpack.Options = {}) {
    return getLazy<T>(Filters.byRegex(regex), options);
}

export function getBySource<T>(sources: Array<string | RegExp>, options: Webpack.Options = {}) {
    return getModule<T>(Filters.bySource(...sources), options);
}
export function getAllBySource<T extends unknown[]>(sources: Array<string | RegExp>, options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.bySource(...sources), options);
}
export function getLazyBySource<T>(sources: Array<string | RegExp>, options: Webpack.Options = {}) {
    return getLazy<T>(Filters.bySource(...sources), options);
}

export function getByDisplayName<T>(name: string, options: Webpack.Options = {}) {
    return getModule<T>(Filters.byDisplayName(name), options);
}
export function getAllByDisplayName<T extends unknown[]>(name: string, options: Webpack.Options = {}) {
    return getAllModules<T>(Filters.byDisplayName(name), options);
}
export function getLazyByDisplayName<T>(name: string, options: Webpack.Options = {}) {
    return getLazy<T>(Filters.byDisplayName(name), options);
}