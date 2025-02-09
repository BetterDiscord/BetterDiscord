import Store from "./base";


export default new class ConfigStore extends Store {
    data = {
        branch: process.env.__BRANCH__!,
        commit: process.env.__COMMIT__!,
        build: process.env.__BUILD__!,
        version: process.env.__VERSION__!,
        dataPath: "",
        appPath: "",
        userData: "",
    };

    get(id: keyof typeof this.data) {
        return this.data[id];
    }

    set(id: keyof typeof this.data, value: string = "") {
        this.data[id] = value;
        this.emit();
    }

    get isDevelopment() {return this.data.build !== "production";}
    get isCanary() {return this.data.branch !== "main";}
};