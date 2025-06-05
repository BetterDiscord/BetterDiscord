/**
 * Simple logger for the lib and plugins.
 *
 * @module Logger
 * @version 0.1.0
 */

/* eslint-disable no-console */

type ConsoleLogTypes = "error" | "debug" | "log" | "warn" | "info";

/**
 * List of logging types.
 */
export const LogTypes: Record<string, ConsoleLogTypes> = {
    /** Alias for error */
    err: "error",
    error: "error",
    /** Alias for debug */
    dbg: "debug",
    debug: "debug",
    log: "log",
    warn: "warn",
    info: "info"
};

export default class Logger {

    /**
     * Logs an error using a collapsed error group with stacktrace.
     *
     * @param {string} module - Name of the calling module.
     * @param {string} message - Message or error to have logged.
     * @param {any} error - Error object to log with the message.
     */
    static stacktrace(module: string, message: any, error: Error) {
        console.error(`%c[${module}]%c ${message}\n\n%c`, "color: #3a71c1; font-weight: 700;", "color: red; font-weight: 700;", "color: red;", error);
    }

    /**
     * Logs using error formatting. For logging an actual error object consider {@link module:Logger.stacktrace}
     *
     * @param {string} module - Name of the calling module.
     * @param {any[]} message - Messages to have logged.
     */
    static err(module: string, ...message: any[]) {Logger._log(module, message, "error");}

    /**
     * Alias for "err"
     * @param {string} module NAme of the calling module
     * @param  {...any} message Messages to have logged.
     */
    static error(module: string, ...message: any[]) {Logger._log(module, message, "error");}

    /**
     * Logs a warning message.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static warn(module: string, ...message: any[]) {Logger._log(module, message, "warn");}

    /**
     * Logs an informational message.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static info(module: string, ...message: any[]) {Logger._log(module, message, "info");}

    /**
     * Logs used for debugging purposes.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static debug(module: string, ...message: any[]) {Logger._log(module, message, "debug");}

    /**
     * Logs used for basic loggin.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static log(module: string, ...message: any[]) {Logger._log(module, message);}

    /**
     * Logs strings using different console levels and a module label.
     *
     * @param {string} module - Name of the calling module.
     * @param {any|Array<any>} message - Messages to have logged.
     * @param {module:Logger.LogTypes} type - Type of log to use in console.
     */
    static _log(module: string, message: any, type: keyof typeof LogTypes = "log") {
        const parsedType = Logger.parseType(type);
        if (!Array.isArray(message)) message = [message];
        console[parsedType](`%c[BetterDiscord]%c [${module}]%c`, "color: #3E82E5; font-weight: 700;", "color: #3a71c1;", "", ...message);
    }

    static parseType(type: keyof typeof LogTypes): ConsoleLogTypes {
        return LogTypes[type] || "log";
    }
}