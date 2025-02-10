import fs from "fs";
import path from "path";

import Builtin from "@structs/builtin";
import DataStore from "@modules/datastore";
import Strings from "@modules/strings";

import Modals from "@ui/modals";


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

const occurrences = (source, substring) => {
    const regex = new RegExp(substring, "g");
    return (source.match(regex) || []).length;
};

export default new class DebugLogs extends Builtin {
    get name() {return "DebugLogs";}
    get category() {return "developer";}
    get id() {return "debugLogs";}

    async enabled() {
        this.logFile = path.join(DataStore.dataFolder, "debug.log");
        await this.checkFilesize();
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
            if (typeof (arg) === "string") {
                const styleCount = occurrences(arg, "%c");
                sanitized.push(arg.replace(/%c/g, ""));
                if (styleCount > 0) i += styleCount;
            }

            if (typeof (arg) === "undefined") sanitized.push("undefined");
            if (typeof (arg) === "object" && arg && arg.message && arg.stack) sanitized.push(`${arg.message}\n${arg.stack}`);
            else if (typeof (arg) === "object") sanitized.push(JSON.stringify(arg, getCircularReplacer()));
            if (typeof (arg) === "function" || typeof (arg) === "boolean" || typeof (arg) === "number") sanitized.push(arg.toString());
        }
        return sanitized.join(" ");
    }

    async checkFilesize() {
        try {
            // Not been created yet, no need to check filesize
            if (!fs.existsSync(this.logFile)) return;
            const stats = fs.statSync(this.logFile);
            const mb = stats.size / (1024 * 1024);
            if (mb < 100) return; // Under 100MB, all good
            return new Promise(resolve => Modals.showConfirmationModal(Strings.Modals.additionalInfo, Strings.Modals.debuglog, {
                confirmText: Strings.Modals.okay,
                cancelText: Strings.Modals.cancel,
                danger: true,
                onConfirm: () => fs.rmSync(this.logFile),
                onClose: resolve
            }));
        }
        catch (e) {
            this.error(e);
        }
    }
};