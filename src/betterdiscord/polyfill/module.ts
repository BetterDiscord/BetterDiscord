import Logger from "@common/logger";

import {compileFunction} from "./vm";
import Remote from "./remote";
import fs from "./fs";


const path = Remote.path;

export const RequireExtensions = {
    ".js": (module: Module, filename: string) => {
        const fileContent = Remote.filesystem.readFile(filename, "utf8") as string;
        module.fileContent = fileContent;
        module._compile(fileContent);
        return module.exports;
    },
    ".json": (module: Module, filename: string) => {
        const fileContent = Remote.filesystem.readFile(filename, "utf8") as string;
        module.fileContent = fileContent;
        module.exports = JSON.parse(fileContent);

        return module.exports;
    }
};

export default class Module {
    static resolveMainFile(mod: string, basePath: string) {
        const parent = path.extname(basePath) ? path.dirname(basePath) : basePath;
        const files = Remote.filesystem.readDirectory(parent);
        if (!Array.isArray(files)) return null;

        for (const file of files) {
            const ext = path.extname(file as string);

            if (file === "package.json") {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const pkg = require(path.resolve(parent, file));
                if (!Reflect.has(pkg, "main")) continue;

                return path.resolve(parent, pkg.main);
            }

            if (ext.slice(0, -ext.length) == "index" && RequireExtensions[ext as keyof typeof RequireExtensions]) return mod;
        }
    }

    static getExtension(mod: string) {
        return path.extname(mod) || Reflect.ownKeys(RequireExtensions).find(e => Remote.filesystem.exists(mod + (e as string)));
    }

    static getFilePath(basePath: string, mod: string) {
        if (!path.isAbsolute(mod)) mod = path.resolve(basePath, mod);
        const defaultExtension = path.extname(mod);
        if (!defaultExtension) {
            const ext = Reflect.ownKeys(RequireExtensions).find(e => Remote.filesystem.exists(mod + (e as string)));
            if (ext) {
                mod = mod + (ext as string);
            }
        }

        return fs.realpathSync(mod);
    }

    static _load(mod: string, basePath: string, createRequire: (m: string) => any) {
        const originalReq = mod;
        if (!path.isAbsolute(mod)) mod = path.resolve(basePath, mod);
        const filePath = this.getFilePath(basePath, mod);
        if (!Remote.filesystem.exists(filePath)) throw new Error(`Cannot find module ${mod}`);
        if (window.require.cache[filePath]) return window.require.cache[filePath].exports;
        const stats = Remote.filesystem.getStats(filePath);
        if (stats.isDirectory()) mod = this.resolveMainFile(mod, basePath)!;
        const ext = this.getExtension(filePath);
        const loader = RequireExtensions[ext as keyof typeof RequireExtensions];

        if (!loader) throw new Error(`Cannot find module ${originalReq}`);
        // @ts-expect-error no, remove with polyfill
        const module = window.require.cache[mod] = new Module(filePath, internalModule, createRequire(mod));
        loader(module, filePath);
        return module.exports;
    }

    static get Module() {return Module;}

    static get createRequire() {return Logger.warn("ContextModule", "Module.createRequire not implemented yet.");}

    static get _extensions() {return RequireExtensions;}

    id: string;
    path: string;
    exports: any;
    parent: Module | null;
    filename: string;
    loaded: boolean;
    children: Module[];
    fileContent?: string;
    require?: (mod: string) => any;

    constructor(id: string, parent: Module | null, require?: (mod: string) => any) {
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

    _compile(code: string) {
        const wrapped = compileFunction(code, ["require", "module", "exports", "__filename", "__dirname", "global"], this.filename);
        wrapped(this.require, this, this.exports, this.filename, this.path, window);
    }
}

const internalModule = new Module(".", null);