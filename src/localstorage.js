/* Localstorage fix */
export default function() {

    const fs = window.require("fs");
    const platform = process.platform;
    const dataPath = (platform === "win32" ? process.env.APPDATA : platform === "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.config") + "/BetterDiscord/";
    const localStorageFile = "localStorage.json";

    let data = {};
    if (fs.existsSync(`${dataPath}${localStorageFile}`)) {
        try {
            data = JSON.parse(fs.readFileSync(`${dataPath}${localStorageFile}`));
        }
        catch (err) {
            console.log(err);
        }
    }
    else if (fs.existsSync(localStorageFile)) {
        try {
            data = JSON.parse(fs.readFileSync(localStorageFile));
        }
        catch (err) {
            console.log(err);
        }
    }

    const storage = data;
    storage.setItem = function(i, v) { 
        storage[i] = v;
        this.save();
    };
    storage.getItem = function(i) {
        return storage[i] || null;
    };
    storage.save = function() {
        fs.writeFileSync(`${dataPath}${localStorageFile}`, JSON.stringify(this), null, 4);
    };

    const lsProxy = new Proxy(storage, {
        set: function(target, name, val) {
            storage[name] = val;
            storage.save();
        },
        get: function(target, name) {
            return storage[name] || null;
        }
    });

    window.localStorage = lsProxy;

}