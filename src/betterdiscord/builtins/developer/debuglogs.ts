import fs from "fs";
import path from "path";

import Builtin from "@structs/builtin";
import Config from "@stores/config";
import {t} from "@common/i18n";

import Modals from "@ui/modals";


const timestamp = () => new Date().toISOString().replace("T", " ").replace("Z", "");
const levels = ["log", "info", "warn", "error", "debug"];
const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_: unknown, value: any) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) return "[Circular Reference]";
            seen.add(value);
        }
        return value;
    };
};

const occurrences = (source: string, substring: string) => {
    const regex = new RegExp(substring, "g");
    return (source.match(regex) || []).length;
};

export default new class DebugLogs extends Builtin {
    get name() {return "DebugLogs";}
    get category() {return "developer";}
    get id() {return "debugLogs";}

    logFile?: string;
    stream?: fs.WriteStream;

    async enabled() {
        this.logFile = path.join(Config.get("channelPath"), "debug.log");
        await this.checkFilesize();
        this.stream = fs.createWriteStream(this.logFile, {flags: "a"});
        this.stream.write(`\n\n================= Starting Debug Log (${timestamp()}) =================\n`);
        for (const level of levels) {
            this.after(console, level, (_, originalArgs) => {
                const data = this.sanitize(...originalArgs);
                this.stream?.write(`[${timestamp()}][CONSOLE:${level.toUpperCase()}] ${data}\n`);
            });
        }
    }

    async disabled() {
        this.unpatchAll();
        if (this.stream) this.stream.end(`\n\n================= Ending Debug Log (${timestamp()}) =================`);
    }

    sanitize(...args: any[]) {
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
            if (!this.logFile || !fs.existsSync(this.logFile)) return;
            const stats = fs.statSync(this.logFile);
            const mb = stats.size / (1024 * 1024);
            if (mb < 100) return; // Under 100MB, all good
            return new Promise<void>(resolve => Modals.showConfirmationModal(t("Modals.additionalInfo"), t("Modals.debuglog"), {
                confirmText: t("Modals.okay"),
                cancelText: t("Modals.cancel"),
                danger: true,
                onConfirm: () => fs.rmSync(this.logFile!),
                onClose: resolve
            }));
        }
        catch (e) {
            this.stacktrace("Could not get debug log filesize", e as Error);
        }
    }
};