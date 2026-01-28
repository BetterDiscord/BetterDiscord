import fs from "@polyfill/fs";
import path from "path";
import Config from "@stores/config";

export default class WebpackCache {
    private static data: Record<string, string>;

    static get(id: string) {
        if (!this.data) this.load();
        return this.data[id];
    }

    static set(id: string, moduleId: string) {
        this.data[id] = moduleId;
        this.saveDebounced();
    }

    static load() {
        // This can't use JsonStore since for some reason it doesn't exist at this point
        const filePath = path.resolve(Config.get("channelPath"), `webpack.json`);
        try {
            const data = fs.readFileSync(filePath).toString();
            this.data = JSON.parse(data);
        }
        catch {
            this.data = {};
        }
    }

    private static saveDebounceTimeout?: Timer;
    private static saveTimeout?: Timer;

    private static saveDebounced() {
        // save after 100ms of inactivity
        if (this.saveDebounceTimeout) clearTimeout(this.saveDebounceTimeout);

        this.saveDebounceTimeout = setTimeout(() => {
            this.save();
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
                this.saveTimeout = undefined;
            }
        }, 100);

        // save guaranteed after 10 seconds
        if (!this.saveTimeout) {
            this.saveTimeout = setTimeout(() => {
                this.save();
                this.saveTimeout = undefined;
                if (this.saveDebounceTimeout) clearTimeout(this.saveDebounceTimeout);
            }, 10000);
        }
    }

    private static save() {
        const filePath = path.resolve(Config.get("channelPath"), `webpack.json`);
        fs.writeFileSync(filePath, JSON.stringify(this.data, null, 4));
    }

    // eslint-disable-next-line no-useless-escape
    private static stackPluginRegex = /\/([^\/]+)\.plugin\.js:(\d+):(\d+)/g;

    static getIdFromStack(suffix?: string | number) {
        const stack = new Error().stack!;

        const matches = stack.matchAll(this.stackPluginRegex);
        let prev = null;
        let plugin = null;
        let discriminator = 0;

        // find the earliest plugin to be in the call stack
        for (const match of matches) {
            if (match[1] !== prev) {
                prev = match[1];
                plugin = match[1];
            }

            // adapted from https://gist.github.com/jlevy/c246006675becc446360a798e2b2d781
            discriminator = (discriminator << 5) - discriminator + parseInt(match[2]);
            discriminator = (discriminator << 5) - discriminator + parseInt(match[3]);
        }

        if (!plugin) return;
        return `${plugin}:${discriminator >>> 0}${suffix !== undefined ? `:${suffix}` : ""}`;
    }
}