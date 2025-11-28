import JsonStore from "@stores/json";

export default class WebpackCache {
    private static data: Record<string, string>;

    static get(id: string) {
        if (!this.data) {
            this.data = JsonStore.get("webpack") as Record<string, string>;
        }

        return this.data[id];
    }

    static set(id: string, moduleId: string) {
        this.data[id] = moduleId;
        this.save();
    }

    private static saveDebounceTimeout?: Timer;
    private static saveTimeout?: Timer;

    private static save() {
        // save after 100ms of inactivity
        if (this.saveDebounceTimeout) clearTimeout(this.saveDebounceTimeout);

        this.saveDebounceTimeout = setTimeout(() => {
            JsonStore.set("webpack", this.data);
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
                this.saveTimeout = undefined;
            }
        }, 100);

        // save guaranteed after 10 seconds
        if (!this.saveTimeout) {
            this.saveTimeout = setTimeout(() => {
                JsonStore.set("webpack", this.data);
                this.saveTimeout = undefined;
                if (this.saveDebounceTimeout) clearTimeout(this.saveDebounceTimeout);
            }, 10000);
        }
    }

    private static stackPluginRegex = /\/([^\/]+)\.plugin\.js:(\d+):(\d+)/g;

    static getIdFromStack(suffix?: string | number) {
        const stack = new Error().stack!;

        const matches = stack.matchAll(this.stackPluginRegex);
        let prev = null;
        let plugin = null;
        let discriminator = 0;

        // find the earliest plugin to be in the call stack
        for (const match of matches) {
            if (match[1] != prev) {
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