import {fs, path, electron, process} from "./remote";
import {Logger, IPCEvents, getNestedProp} from "@betterdiscord/common";

const buildInfo = electron.ipcRenderer.sendSync(IPCEvents.GET_BUILD_INFO) as import("../../types/build_info").default;

const DataStore = new class DataStore {
    public _writingPromise = Promise.resolve();
    public bdFolder = "";
    public pluginsFolder = "";
    public themesFolder = "";
    public packagesFolder = "";
    public dataFolder = "";
    public themeDataFolder = "";
    public pluginDataFolder = "";
    public data: {
        misc: any,
        themes?: any,
        plugins?: any,
        addon_data: {
            theme: {[key: string]: any},
            plugin: {[key: string]: any}
        },
        packages?: any
    } = {
        misc: {},
        addon_data: {
            theme: {},
            plugin: {}
        }
    };

    public async initialize() {
        this.bdFolder = (() => {
            switch (process.platform) {
                case "win32":
                case "darwin":
                    return path.resolve(electron.fileManager.getPath("appData"), "BetterDiscord");
                
                default:
                    return path.join(process.env.XDG_CONFIG_HOME || path.resolve(process.env.HOME as string, ".config"), "BetterDiscord");
            }
        })();

        this.pluginsFolder = path.resolve(this.bdFolder, "plugins");
        this.themesFolder = path.resolve(this.bdFolder, "themes");
        this.packagesFolder = path.resolve(this.bdFolder, "packages");
        this.dataFolder = path.resolve(this.bdFolder, "data", buildInfo.releaseChannel);
        this.themeDataFolder = path.resolve(this.bdFolder, "config", "themes");
        this.pluginDataFolder = path.resolve(this.bdFolder, "config", "plugins");

        await this.ensureFolders();
        await Promise.all([
            this.loadData(),
            this.loadAddonData()
        ]);
    }

    private async ensureFolders(): Promise<void> {
        const folders = [
            this.bdFolder,
            this.themeDataFolder, this.pluginDataFolder,
            this.dataFolder,
            this.pluginsFolder, this.themesFolder,
            this.packagesFolder
        ];

        for (const folder of folders) {
            if (!await fs.exists(folder)) {
                try {
                    await fs.mkdir(folder, {recursive: true});
                } catch (error) {
                    Logger.stacktrace("DataStore", `Failed to create directory: ${folder.replace(this.bdFolder, "")}`, error as Error);
                }
            }
        }
    }
    
    private async loadData(): Promise<void> {
        const dataFiles = await <Promise<string[]>>(async () => {
            const files = await fs.readdir(this.dataFolder);
            const isDirectory = (p: string) => fs.stat(p).then(p => p.isDirectory()); 
            const mapped = files.map(async f => 
                !await isDirectory(path.resolve(this.dataFolder, f)) &&
                f.endsWith(".json") &&
                f
            );
    
            return Promise.all(mapped)
                .then(f => f.filter(Boolean));
        })();

        for (const file of dataFiles) {
            let data;
            const location = path.resolve(this.dataFolder, file);

            try {
                data = JSON.parse(await fs.readFile(location, "utf8") as string);
            } catch (error) {
                Logger.stacktrace("DataStore", `Failed to load data file ${file}:`, error as Error);
                data = {};
            }

            this.data[file.slice(0, file.indexOf(".")) as keyof typeof this.data] = data;
        }
    }

    private async loadAddonData(): Promise<void> {
        for (const addonType in this.data.addon_data) {
            const folder = <string>{
                plugin: this.pluginDataFolder,
                theme: this.themeDataFolder
            }[addonType];

            const files = await fs.readdir(folder);

            for (const file of files) {
                let data;
                const location = path.resolve(folder, file);

                try {
                    data = JSON.parse(await fs.readFile(location, "utf8") as string);
                } catch (error) {
                    Logger.stacktrace("DataStore", `Failed to load data for ${file} of ${addonType}s:`, error as Error);
                    data = {};
                }

                this.data.addon_data[addonType as "theme" | "plugin"][file.slice(0, file.indexOf("."))] = data;
            }
        }
    }

    public getAddonData<T>(addon: string, addonType: "theme" | "plugin", key: string, def?: T): T {
        const addonConfigs = <any>this.data.addon_data[addonType];

        if (!addonConfigs[addon]) addonConfigs[addon] = {};

        return (
            key.includes(".")
                ? getNestedProp(addonConfigs[addon], key)
                : addonConfigs[addon][key]
        ) ?? def; 
    }

    public setAddonData(addon: string, addonType: "theme" | "plugin", key: string, value: any): void {
        const addonConfigs = <any>this.data.addon_data[addonType];
        
        if (!addonConfigs[addon]) addonConfigs[addon] = {};

        if (key.includes(".")) {
            this.setNested(addonConfigs[addon], key, value);
        } else {
            addonConfigs[addon][key] = value;
        }

        this._writingPromise = this._writingPromise.then(() => {
            return fs.writeFile(this.getAddonFile(addon, addonType), JSON.stringify(value, null, 4));
        });
    }

    public getBDData<T>(key: string, def?: T): T {
        return (
            key.includes(".")
                ? getNestedProp(this.data.misc, key)
                : this.data.misc[key]
        ) ?? def;
    }

    public setBDData(key: string, value: any): void {
        if (key.includes(".")) {
            this.setNested(this.data.misc, key, value);
        } else {
            this.data.misc[key] = value;
        }

        this._writingPromise = this._writingPromise.then(() => {
            return fs.writeFile(this.getFilePath("misc"), JSON.stringify(value, null, 4));
        });
    }

    public getData<T>(key: keyof typeof this.data, def?: T): T {
        return (
            key.includes(".")
                ? getNestedProp(this.data, key)
                : this.data[key]
        ) ?? def;
    }

    public setData(key: keyof typeof this.data, value: any): void {
        if (key.includes(".")) {
            this.setNested(this.data, key, value);
        } else {
            this.data[key] = value;
        }

        this._writingPromise = this._writingPromise.then(() => {
            return fs.writeFile(this.getFilePath(key), JSON.stringify(value, null, 4));
        });
    }

    // Internal Utilities

    private setNested(object: any, key: string, value: any) {
        const last = <string>key.split(".").pop();
        const target = getNestedProp(object, key);

        if (!target) throw new Error(`Cannot set property ${key} of undefined.`);

        target[last] = value;
    }

    private getAddonFile(addon: string, addonType: "theme" | "plugin"): string {
        const dataFolder = {
            plugin: this.pluginDataFolder,
            theme: this.themeDataFolder
        }[addonType];

        return path.resolve(dataFolder, addon + ".json");
    }

    private getFilePath(key: keyof typeof this.data): string {
        return path.resolve(this.dataFolder, key + ".json");
    }
}

export default DataStore;
