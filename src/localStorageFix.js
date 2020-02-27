export default function() {

    const __fs = window.require("fs");
    const __process = window.require("process");
    const __platform = __process.platform;
    const __dataPath = (__platform === "win32" ? __process.env.APPDATA : __platform === "darwin" ? __process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.config") + "/BetterDiscord/";
    const localStorageFile = "localStorage.json";

    let __data = {};
    if (__fs.existsSync(`${__dataPath}${localStorageFile}`)) {
        try {
            __data = JSON.parse(__fs.readFileSync(`${__dataPath}${localStorageFile}`));
        }
        catch (err) {
            console.log(err);
        }
    }
    else if (__fs.existsSync(localStorageFile)) {
        try {
            __data = JSON.parse(__fs.readFileSync(localStorageFile));
        }
        catch (err) {
            console.log(err);
        }
    }

    const __ls = __data;
    __ls.setItem = function(i, v) {
        __ls[i] = v;
        this.save();
    };
    __ls.getItem = function(i) {
        return __ls[i] || null;
    };
    __ls.save = function() {
        __fs.writeFileSync(`${__dataPath}${localStorageFile}`, JSON.stringify(this), null, 4);
    };

    const __proxy = new Proxy(__ls, {
        set: function(target, name, val) {
            __ls[name] = val;
            __ls.save();
        },
        get: function(target, name) {
            return __ls[name] || null;
        }
    });

    window.localStorage = __proxy;
}