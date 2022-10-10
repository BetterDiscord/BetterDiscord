import Logger from "common/logger";
import {compileFunction} from "./vm";
import Remote from "./remote";
import fs from "./fs";

const path = Remote.path;

export const RequireExtensions = {
    ".js": (module, filename) => {
        const fileContent = Remote.filesystem.readFile(filename, "utf8");
        module.fileContent = fileContent;
        module._compile(fileContent);
        return module.exports;
    },
    ".json": (module, filename) => {
        const fileContent = Remote.filesystem.readFile(filename, "utf8");
        module.fileContent = fileContent;
        module.exports = JSON.parse(fileContent);

        return module.exports;
    }
};

export default class Module {
    static resolveMainFile(mod, basePath) {
        const parent = path.extname(basePath) ? path.dirname(basePath) : basePath;
        const files = Remote.filesystem.readDirectory(parent);
        if (!Array.isArray(files)) return null;

        for (const file of files) {
            const ext = path.extname(file);

            if (file === "package.json") {
                const pkg = __non_webpack_require__(path.resolve(parent, file));
                if (!Reflect.has(pkg, "main")) continue;

                return path.resolve(parent, pkg.main);
            }

            if (path.slice(0, -ext.length) == "index" && RequireExtensions[ext]) return mod;
        }
    }

    static getExtension(mod) {
        return path.extname(mod) || Reflect.ownKeys(RequireExtensions).find(e => Remote.filesystem.exists(mod + e));
    }

    static getFilePath(basePath, mod) {
        if (!path.isAbsolute(mod)) mod = path.resolve(basePath, mod);
        const defaultExtension = path.extname(mod);
        if (!defaultExtension) {
            const ext = Reflect.ownKeys(RequireExtensions).find(e => Remote.filesystem.exists(mod + e));
            if (ext) {
                mod = mod + ext;
            }
        }

        return fs.realpathSync(mod);
    }

    static _load(mod, basePath, createRequire) {
        const originalReq = mod;
        if (!path.isAbsolute(mod)) mod = path.resolve(basePath, mod);
        const filePath = this.getFilePath(basePath, mod);
        if (!Remote.filesystem.exists(filePath)) throw new Error(`Cannot find module ${mod}`);
        if (window.require.cache[filePath]) return window.require.cache[filePath].exports;
        const stats = Remote.filesystem.getStats(filePath);
        if (stats.isDirectory()) mod = this.resolveMainFile(mod, basePath);
        const ext = this.getExtension(filePath);
        const loader = RequireExtensions[ext];

        if (!loader) throw new Error(`Cannot find module ${originalReq}`);
        const module = window.require.cache[mod] = new Module(filePath, internalModule, createRequire(mod));
        loader(module, filePath);
        return module.exports;
    }

    static get Module() {return Module;}

    static get createRequire() {return Logger.warn("ContextModule", "Module.createRequire not implemented yet.");}

    static get _extensions() {return RequireExtensions;}

    constructor(id, parent, require) {
        this.id = id;
        this.path = Remote.path.dirname(id);
        this.exports = {};
        this.parent = parent;
        this.filename = id;
        this.loaded = false;
        this.children = [];
        this.require = require;

        if (parent) parent.children.push(this);
    }

    _compile(code) {
        const wrapped = compileFunction(code, ["require", "module", "exports", "__filename", "__dirname", "global"], this.filename);
        wrapped(this.require, this, this.exports, this.filename, this.path, window);
    }
}

const internalModule = new Module(".", null);