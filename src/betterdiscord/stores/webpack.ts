import Store from "./base";
import JsonStore from "./json";

export default new class WebpackStore extends Store {
    data = JsonStore.get("webpack") as Record<string, string>;

    saveDebounceTimeout?: Timer;
    saveTimeout?: Timer;

    save() {
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
};