import Builtin from "../../structs/builtin";
import {WebpackModules} from "modules";

const normalizedPrefix = "da";
const randClass = new RegExp(`^(?!${normalizedPrefix}-)((?:[A-Za-z]|[0-9]|-)+)-(?:[A-Za-z]|[0-9]|-|_){6}$`);

export default new class ClassNormalizer extends Builtin {
    get id() {return "classNormalizer";}
    get category() {return "general";}
    get name() {return "ClassNormalizer";}

    enabled() {
        if (this.hasPatched) return;
        this.patchClassModules(WebpackModules.getModules(this.moduleFilter.bind(this)));
        this.normalizeElement(document.querySelector("#app-mount"));
        this.hasPatched = true;
        this.patchDOMMethods();
    }

    disabled() {
        if (!this.hasPatched) return;
        this.unpatchClassModules(WebpackModules.getModules(this.moduleFilter.bind(this)));
        this.revertElement(document.querySelector("#app-mount"));
        this.hasPatched = false;
    }

    patchClassModules(modules) {
        for (const module of modules) {
            this.patchClassModule(normalizedPrefix, module);
        }
    }

    unpatchClassModules(modules) {
        for (const module of modules) {
            this.unpatchClassModule(normalizedPrefix, module);
        }
    }

    shouldIgnore(value) {
        if (!isNaN(value)) return true;
        if (value.endsWith("px") || value.endsWith("ch") || value.endsWith("em") || value.endsWith("ms")) return true;
        if (value.startsWith("layerContainer-")) return true;
        if (value.startsWith("#") && (value.length == 7 || value.length == 4)) return true;
        if (value.includes("calc(") || value.includes("rgba")) return true;
        return false;
    }

    moduleFilter(module) {
        if (typeof module !== "object" || Array.isArray(module)) return false;
        if (module.__esModule) return false;
        if (!Object.keys(module).length) return false;
        for (const baseClassName in module) {
            const value = module[baseClassName];
            if (typeof value !== "string") return false;
            if (this.shouldIgnore(value)) continue;
            if (value.split("-").length === 1) return false;
            if (!randClass.test(value.split(" ")[0])) return false;
        }

        return true;
    }

    patchClassModule(componentName, classNames) {
        for (const baseClassName in classNames) {
            const value = classNames[baseClassName];
            if (this.shouldIgnore(value)) continue;
            const classList = value.split(" ");
            for (const normalClass of classList) {
                const match = normalClass.match(randClass);
                if (!match || !match.length || match.length < 2) continue; // Shouldn't ever happen since they passed the moduleFilter, but you never know
                const camelCase = match[1].split("-").map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join("");
                classNames[baseClassName] += ` ${componentName}-${camelCase}`;
            }
        }
    }

    unpatchClassModule(componentName, classNames) {
        for (const baseClassName in classNames) {
            const value = classNames[baseClassName];
            if (this.shouldIgnore(value)) continue;
            let newString = "";
            const classList = value.split(" ");
            for (const normalClass of classList) {
                if (normalClass.startsWith(`${componentName}-`)) continue;
                newString += ` ${normalClass}`;
            }
            classNames[baseClassName] = newString.trim();
        }
    }

    normalizeElement(element) {
        if (!(element instanceof Element)) return;
        const classes = element.classList;
        for (let c = 0, clen = classes.length; c < clen; c++) {
            if (!randClass.test(classes[c])) continue;
            const match = classes[c].match(randClass)[1];
            const newClass = match.split("-").map((s, i) => i ? s[0].toUpperCase() + s.slice(1) : s).join("");
            element.classList.add(`${normalizedPrefix}-${newClass}`);
        }
        for (const child of element.children) this.normalizeElement(child);
    }

    revertElement(element) {
        if (!(element instanceof Element)) return;
        if (element.children && element.children.length) this.revertElement(element.children[0]);
        if (element.nextElementSibling) this.revertElement(element.nextElementSibling);
        const classes = element.classList;
        const toRemove = [];
        for (let c = 0; c < classes.length; c++) {
            if (classes[c].startsWith(`${normalizedPrefix}-`)) toRemove.push(classes[c]);
        }
        element.classList.remove(...toRemove);
    }
    
    patchDOMMethods() {
        const contains = DOMTokenList.prototype.contains;
        DOMTokenList.prototype.contains = function(token) {
            // const tokens = token.split(" ");
            return Reflect.apply(contains, this, [token.split(" ")[0]]);
            // return tokens.every(t => contains.call(this, t));
        };

        const add = DOMTokenList.prototype.add;
        DOMTokenList.prototype.add = function(...tokens) {
            for (let t = 0; t < tokens.length; t++) {
                tokens[t] = tokens[t].split(" ")[0];
            }
            return Reflect.apply(add, this, tokens);
        };

        const remove = DOMTokenList.prototype.remove;
        DOMTokenList.prototype.remove = function(...tokens) {
            for (let t = 0; t < tokens.length; t++) {
                tokens[t] = tokens[t].split(" ")[0];
            }
            return Reflect.apply(remove, this, tokens);
        };
    }

};