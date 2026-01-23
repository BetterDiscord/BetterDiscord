import type {Webpack} from "discord";
import {webpackRequire} from "./require";

function assign<T extends Webpack.Filter | Webpack.ExportedOnlyFilter>(filter: T, args: any) {
    return Object.assign(filter, {
        [Symbol.for("BetterDiscord.Filter")]: args
    });
}

export function byKeys(props: string[], filter: Webpack.ExportedOnlyFilter = m => m): Webpack.ExportedOnlyFilter {
    return assign(module => {
        if (!module) return false;
        if (typeof (module) !== "object" && typeof (module) !== "function") return false;
        const component = filter(module);
        if (!component) return false;
        for (let p = 0; p < props.length; p++) {
            if (!(props[p] in component)) return false;
        }
        return true;
    }, {
        props,
        filter
    });
}

export function byPrototypeKeys(fields: string[], filter: Webpack.ExportedOnlyFilter = m => m): Webpack.ExportedOnlyFilter {
    return assign(module => {
        if (!module) return false;
        if (typeof (module) !== "object" && typeof (module) !== "function") return false;
        const component = filter(module);
        if (!component) return false;
        if (!component.prototype) return false;
        for (let f = 0; f < fields.length; f++) {
            if (!(fields[f] in component.prototype)) return false;
        }
        return true;
    }, {
        fields,
        filter
    });
}

export function byRegex(search: RegExp, filter: Webpack.ExportedOnlyFilter = m => m): Webpack.ExportedOnlyFilter {
    return assign(module => {
        const method = filter(module);
        if (!method) return false;
        let methodString = "";
        try {methodString = method.toString([]);}
        catch {methodString = method.toString();}
        return methodString.search(search) !== -1;
    }, {
        search,
        filter
    });
}

export function bySource(...searches: Array<string | RegExp>): Webpack.Filter {
    const moduleCache = webpackRequire.m;

    return assign((_, module) => {
        const id = module?.id;
        if (!id) return false;

        let source: string;
        try {
            source = moduleCache[id].toString();
        }
        catch {
            return false;
        }

        if (!source) return false;

        for (let i = 0; i < searches.length; i++) {
            const search = searches[i];
            if (typeof search === "string") {
                if (!source.includes(search)) return false;
            }
            else {
                if (!search.test(source)) return false;
            }
        }

        return true;
    }, {
        searches
    });
}

export function byStrings(...strings: string[]): Webpack.ExportedOnlyFilter {
    return assign(module => {
        if (typeof module !== "function") return false;

        try {
            const str = String(module);

            for (const s of strings) {
                if (!str.includes(s)) return false;
            }

            return true;
        }
        catch {return false;}
    }, {
        strings
    });
}

export function byDisplayName(name: string): Webpack.ExportedOnlyFilter {
    return assign(module => {
        return module && module.displayName === name;
    }, {
        name
    });
}

export function byStoreName(name: string): Webpack.ExportedOnlyFilter {
    return assign(module => {
        return module?._dispatchToken && module?.getName?.() === name;
    }, {
        name
    });
}

export function combine(...filters: Webpack.ExportedOnlyFilter[]): Webpack.ExportedOnlyFilter;
export function combine(...filters: Array<Webpack.ExportedOnlyFilter | Webpack.Filter>): Webpack.Filter;
export function combine(...filters: Webpack.Filter[]): Webpack.Filter {
    return assign((exports, module, id) => {
        return filters.every(filter => filter(exports, module, id));
    }, {
        filters
    });
}

export function not(filter: Webpack.ExportedOnlyFilter): Webpack.ExportedOnlyFilter;
export function not(filter: Webpack.ExportedOnlyFilter | Webpack.Filter): Webpack.Filter;
export function not(filter: Webpack.Filter): Webpack.Filter {
    return assign((exports, module, id) => !filter(exports, module, id), {
        filter
    });
}