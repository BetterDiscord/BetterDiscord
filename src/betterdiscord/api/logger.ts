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


/**
 * `Logger` is a helper class to log data in a nice and consistent way. An instance is available on {@link BdApi}.
 * @type Logger
 * @summary {@link Logger} is a simple utility for logging information.
 * @name Logger
 */
class Logger {

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
    error(pluginName: string, ...message: any[]) {this.#_log(pluginName, message, "error");}

    /**
     * Logs a warning message.
     *
     * @param {string} pluginName - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    warn(pluginName: string, ...message: any[]) {this.#_log(pluginName, message, "warn");}

    /**
     * Logs an informational message.
     *
     * @param {string} pluginName - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    info(pluginName: string, ...message: any[]) {this.#_log(pluginName, message, "info");}

    /**
     * Logs used for debugging purposes.
     *
     * @param {string} pluginName - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    debug(pluginName: string, ...message: any[]) {this.#_log(pluginName, message, "debug");}

    /**
     * Logs used for basic loggin.
     *
     * @param {string} pluginName - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    log(pluginName: string, ...message: any[]) {this.#_log(pluginName, message);}

    /**
     * Logs strings using different console levels and a module label.
     *
     * @param {string} module - Name of the calling module.
     * @param {any|Array<any>} message - Messages to have logged.
     * @param {module:Logger.LogTypes} type - Type of log to use in console.
     */
    #_log(pluginName: string, message: any, type: keyof typeof LogTypes = "log") {
        type = parseType(type);

        // Normalize messages to be an array for later spreading
        if (!Array.isArray(message)) message = message ? [message] : [];

        // If a name was set via constructor move the "name" to be part of the message
        if (pluginName && this.#pluginName) message = [pluginName, ...message];

        const displayName = this.#pluginName || pluginName;
        console[type](`%c[${displayName}]%c`, this.#nameStyle, this.#messageStyle, ...message);
    }
}


Object.freeze(Logger);
Object.freeze(Logger.prototype);
export default Logger;