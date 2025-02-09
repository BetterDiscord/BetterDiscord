import type {Webpack} from "discord";
import Logger from "@common/logger";

const hasThrown = new WeakSet();

export const wrapFilter = (filter: Webpack.Filter): Webpack.Filter => (exports, module, moduleId) => {
    try {
        if (exports instanceof Window) return false;
        if (exports?.default?.remove && exports?.default?.set && exports?.default?.clear && exports?.default?.get && !exports?.default?.sort) return false;
        if (exports.remove && exports.set && exports.clear && exports.get && !exports.sort) return false;
        if (exports?.default?.getToken || exports?.default?.getEmail || exports?.default?.showToken) return false;
        if (exports.getToken || exports.getEmail || exports.showToken) return false;
        return filter(exports, module, moduleId);
    }
    catch (error) {
        if (!hasThrown.has(filter)) Logger.warn("WebpackModules~getModule", "Module filter threw an exception.", error, {filter, module});
        hasThrown.add(filter);
        return false;
    }
};

const TypedArray = Object.getPrototypeOf(Uint8Array);
export function shouldSkipModule(exports: any) {
    if (!(typeof exports === "object" || typeof exports === "function")) return true;
    if (!exports) return true;
    if (exports.TypedArray) return true;
    if (exports === window) return true;
    if (exports === document.documentElement) return true;
    if (exports[Symbol.toStringTag] === "DOMTokenList") return true;
    if (exports === Symbol) return true;
    if (exports instanceof Window) return true;
    if (exports instanceof TypedArray) return true;
    return false;
}

export function getDefaultKey(module: Webpack.Module): Webpack.DefaultKey | undefined {
    if ("Z" in module.exports) return "Z";
    if ("ZP" in module.exports) return "ZP";
    if (module.exports.__esModule && "default" in module.exports) return "default";
}