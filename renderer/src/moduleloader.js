import BdApi from "./modules/pluginapi";

export default function() {
    const namespace = "betterdiscord";
    const prefix = `${namespace}/`;
    const Module = require("module");
    const load = Module._load;

    Module._load = function(request) {
        if (request === "process") {
            return window.process;
        }

        if (request === namespace || request.startsWith(prefix)) {
            const requested = request.slice(prefix.length);
            if (requested == "bdapi") return BdApi;
        }

        return load.apply(this, arguments);
    };

    return function() {
        Module._load = load;
    };
}