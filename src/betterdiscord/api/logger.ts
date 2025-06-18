/**
 * Simple logger for the lib and plugins.
 *
 * @module Logger
 * @version 0.1.0
 */

/* eslint-disable no-console */

/**
 * List of logging types.
 */

const LogTypes = {
    error: "error",
    debug: "debug",
    log: "log",
    warn: "warn",
    info: "info"
};

const parseType = (type: string) => (LogTypes[type as keyof typeof LogTypes] || "log") as keyof typeof LogTypes;

type LogArgs<Bounded extends boolean> = [
    ...(Bounded extends false ? [name: string] : []),
    ...message: any[]
];

/**
 * `Logger` is a helper class to log data in a nice and consistent way. An instance is available on {@link BdApi}.
 * @type Logger
 * @summary {@link Logger} is a simple utility for logging information.
 * @name Logger
 */
class Logger<Bounded extends boolean> {

    #pluginName = "";
    #nameStyle = "color: #3a71c1; font-weight: 700;";
    #messageStyle = "";

    /**
     * @param {string} pluginName - Name of the plugin
     * @param {string} nameStyle - CSS to style the plugin name
     * @param {string} messageStyle - CSS to style the main message
     * @returns
     */
    constructor(pluginName?: string, nameStyle?: string, messageStyle?: string) {
        if (!pluginName) return;
        this.#pluginName = pluginName;
        if (nameStyle) this.#nameStyle = nameStyle;
        if (messageStyle) this.#messageStyle = messageStyle;
    }

    /**
     * Logs an error using a collapsed error group with stacktrace.
     *
     * @param {string} pluginName - Name of the calling module.
     * @param {string} message - Message or error to have logged.
     * @param {Error} error - Error object to log with the message.
     */
    stacktrace(pluginName: string, message: any, error: Error) {
        if (this.#pluginName) {
            error = message;
            message = pluginName;
            pluginName = this.#pluginName;
        }
        console.error(`%c[${pluginName}]%c ${message}\n\n%c`, this.#nameStyle, "color: red; font-weight: 700;", "color: red;", error);
    }

    /**
     * Logs an error message.
     *
     * @param {string} pluginName Name of the calling module
     * @param  {...any} message Messages to have logged.
     */
    error(...messages: LogArgs<Bounded>) {this.#_log(messages, "error");}

    /**
     * Logs a warning message.
     *
     * @param {string} pluginName - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    warn(...messages: LogArgs<Bounded>) {this.#_log(messages, "warn");}

    /**
     * Logs an informational message.
     *
     * @param {string} pluginName - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    info(...messages: LogArgs<Bounded>) {this.#_log(messages, "info");}

    /**
     * Logs used for debugging purposes.
     *
     * @param {string} pluginName - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    debug(...args: LogArgs<Bounded>) {this.#_log(args, "debug");}

    /**
     * Logs used for basic loggin.
     *
     * @param {string} pluginName - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    log(...messages: LogArgs<Bounded>) {this.#_log(messages);}

    /**
     * Logs strings using different console levels and a module label.
     *
     * @param {string} module - Name of the calling module.
     * @param {any|Array<any>} message - Messages to have logged.
     * @param {module:Logger.LogTypes} type - Type of log to use in console.
     */
    #_log(messages: LogArgs<Bounded>, type: keyof typeof LogTypes = "log") {
        type = parseType(type);

        let pluginName = this.#pluginName;
        if (!this.#pluginName) {
            pluginName = messages.shift() as string;
        }

        console[type](`%c[${pluginName}]%c`, this.#nameStyle, this.#messageStyle, ...messages);
    }
}


Object.freeze(Logger);
Object.freeze(Logger.prototype);
export default Logger;