/**
 * Allows for grabbing and searching through Discord's webpacked modules.
 * @module WebpackModules
 * @version 0.0.2
 */

/**
 * Checks if a given module matches a set of parameters.
 * @callback module:WebpackModules.Filters~filter
 * @param {*} module - module to check
 * @returns {boolean} - True if the module matches the filter, false otherwise
 */

/**
 * Filters for use with {@link module:WebpackModules} but may prove useful elsewhere.
 */
export class Filters {
    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
     * @param {Array<string>} props - Array of property names
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byProperties(props, filter = m => m) {
        return module => {
            const component = filter(module);
            if (!component) return false;
            return props.every(property => component[property] !== undefined);
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties on the object's prototype.
     * @param {Array<string>} fields - Array of property names
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties on the object's prototype
     */
    static byPrototypeFields(fields, filter = m => m) {
        return module => {
            const component = filter(module);
            if (!component) return false;
            if (!component.prototype) return false;
            return fields.every(field => component.prototype[field] !== undefined);
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a regex.
     * @param {RegExp} search - A RegExp to check on the module
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byCode(search, filter = m => m) {
        return module => {
            const method = filter(module);
            if (!method) return false;
            return method.toString([]).search(search) !== -1;
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by strings.
     * @param {...String} search - A RegExp to check on the module
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of strings
     */
    static byString(...strings) {
        return module => {
            const moduleString = module.toString([]);
            for (const s of strings) {
                if (!moduleString.includes(s)) return false;
            }
            return true;
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
     * @param {string} name - Name the module should have
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byDisplayName(name) {
        return module => {
            return module && module.displayName === name;
        };
    }

    /**
     * Generates a combined {@link module:WebpackModules.Filters~filter} from a list of filters.
     * @param {...module:WebpackModules.Filters~filter} filters - A list of filters
     * @returns {module:WebpackModules.Filters~filter} - Combinatory filter of all arguments
     */
    static combine(...filters) {
        return module => {
            return filters.every(filter => filter(module));
        };
    }
}

const protect = theModule => {
    if (theModule.remove && theModule.set && theModule.clear && theModule.get && !theModule.sort) return null;
    if (!theModule.getToken && !theModule.getEmail && !theModule.showToken) return theModule;
    const proxy = new Proxy(theModule, {
        getOwnPropertyDescriptor: function(obj, prop) {
            if (prop === "getToken" || prop === "getEmail" || prop === "showToken") return undefined;
            return Object.getOwnPropertyDescriptor(obj, prop);
        },
        get: function(obj, func) {
            if (func == "getToken") return () => "mfa.XCnbKzo0CLIqdJzBnL0D8PfDruqkJNHjwHXtr39UU3F8hHx43jojISyi5jdjO52e9_e9MjmafZFFpc-seOMa";
            if (func == "getEmail") return () => "puppet11112@gmail.com";
            if (func == "showToken") return () => true;
            // if (func == "__proto__") return proxy;
            return obj[func];
        }
    });
    return proxy;
};

export default class WebpackModules {

    static find(filter, first = true) {return this.getModule(filter, first);}
    static findAll(filter) {return this.getModule(filter, false);}
    static findByUniqueProperties(props, first = true) {return first ? this.getByProps(...props) : this.getAllByProps(...props);}
    static findByDisplayName(name) {return this.getByDisplayName(name);}

    /**
     * Finds a module using a filter function.
     * @param {Function} filter A function to use to filter modules
     * @param {Boolean} first Whether to return only the first matching module
     * @return {Any}
     */
    static getModule(filter, first = true) {
        const modules = this.getAllModules();
        const rm = [];
        for (const index in modules) {
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const {exports} = module;
            let foundModule = null;

            if (!exports) continue;
            if (exports.__esModule && exports.default && filter(exports.default)) foundModule = exports.default;
            if (filter(exports)) foundModule = exports;
            if (!foundModule) continue;
            if (first) return protect(foundModule);
            rm.push(protect(foundModule));
        }
        
        return first || rm.length == 0 ? undefined : rm;
    }

    /**
     * Finds all modules matching a filter function.
     * @param {Function} filter A function to use to filter modules
     */
    static getModules(filter) {return this.getModule(filter, false);}

    /**
     * Finds a module by its name.
     * @param {String} name The name of the module
     * @param {Function} fallback A function to use to filter modules if not finding a known module
     * @return {Any}
     */
    // static getModuleByName(name, fallback) {
    //     if (DiscordModules.hasOwnProperty(name)) return DiscordModules[name];
    //     if (!fallback) return undefined;
    //     const module = this.getModule(fallback, true);
    //     return module ? DiscordModules[name] = module : undefined;
    // }

    /**
     * Finds a module by its display name.
     * @param {String} name The display name of the module
     * @return {Any}
     */
    static getByDisplayName(name) {
        return this.getModule(Filters.byDisplayName(name), true);
    }

    /**
     * Finds a module using its code.
     * @param {RegEx} regex A regular expression to use to filter modules
     * @param {Boolean} first Whether to return the only the first matching module
     * @return {Any}
     */
    static getByRegex(regex, first = true) {
        return this.getModule(Filters.byCode(regex), first);
    }

    /**
     * Finds a single module using properties on its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any}
     */
    static getByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), true);
    }

    /**
     * Finds all modules with a set of properties of its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any}
     */
    static getAllByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), false);
    }

    /**
     * Finds a single module using its own properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    static getByProps(...props) {
        return this.getModule(Filters.byProperties(props), true);
    }

    /**
     * Finds all modules with a set of properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    static getAllByProps(...props) {
        return this.getModule(Filters.byProperties(props), false);
    }

    /**
     * Finds a single module using a set of strings.
     * @param {...String} props Strings to use to filter modules
     * @return {Any}
     */
    static getByString(...strings) {
        return this.getModule(Filters.byString(...strings), true);
    }

    /**
     * Finds all modules with a set of strings.
     * @param {...String} strings Strings to use to filter modules
     * @return {Any}
     */
    static getAllByString(...strings) {
        return this.getModule(Filters.byString(...strings), false);
    }

    /**
     * Discord's __webpack_require__ function.
     */
    static get require() {
        if (this._require) return this._require;
        const id = "bbd-webpackmodules";
        const __webpack_require__ = window.webpackJsonp.push([[], {
            [id]: (module, exports, __internal_require__) => module.exports = __internal_require__
        }, [[id]]]);
        delete __webpack_require__.m[id];
        delete __webpack_require__.c[id];
        return this._require = __webpack_require__;
    }

    /**
     * Returns all loaded modules.
     * @return {Array}
     */
    static getAllModules() {
        return this.require.c;
    }

}