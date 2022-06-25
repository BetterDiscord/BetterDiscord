const fs = require("fs");
const path = require("path");
import Builtin from "../../structs/builtin";
import DataStore from "../../modules/datastore";
import Utilities from "../../modules/utilities";


const timestamp = () => new Date().toISOString().replace("T", " ").replace("Z", "");
const levels = ["log", "info", "warn", "error", "debug"];
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) return "[Circular Reference]";
            seen.add(value);
        }
        return value;
    };
};

export default new class DebugLogs extends Builtin {
    get name() {return "DebugLogs";}
    get category() {return "developer";}
    get id() {return "debugLogs";}

    enabled() {
        this.logFile = path.join(DataStore.dataFolder, "debug.log");
        this.stream = fs.createWriteStream(this.logFile, {flags: "a"});
        this.stream.write(`\n\n================= Starting Debug Log (${timestamp()}) =================\n`);
        for (const level of levels) {
            this.after(console, level, (_, originalArgs) => {
                const data = this.sanitize(...originalArgs);
                this.stream.write(`[${timestamp()}][CONSOLE:${level.toUpperCase()}] ${data}\n`);
            });
        }
    }

    disabled() {
        this.unpatchAll();
        if (this.stream) this.stream.end(`\n\n================= Ending Debug Log (${timestamp()}) =================`);
    }

    sanitize(...args) {
        const sanitized = [];
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (typeof(arg) === "string") {
                const styleCount = Utilities.occurrences(arg, "%c");
                sanitized.push(arg.replace(/%c/g, ""));
                if (styleCount > 0) i += styleCount;
            }

            if (typeof(arg) === "undefined") sanitized.push("undefined");
            if (typeof(arg) === "object" && arg && arg.message && arg.stack) sanitized.push(`${arg.message}\n${arg.stack}`);
            else if (typeof(arg) === "object") sanitized.push(JSON.stringify(arg, getCircularReplacer()));
            if (typeof(arg) === "function" || typeof(arg) === "boolean" || typeof(arg) === "number") sanitized.push(arg.toString());
        }
        return sanitized.join(" ");
    }
};