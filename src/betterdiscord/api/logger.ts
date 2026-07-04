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
 */
class Logger {
    #nameStyle = "color: #3a71c1; font-weight: 700;";
    #messageStyle = "";

    /** @ignore */
    constructor() {};

    /**
     * Logs an error using a collapsed error group with stacktrace.
     *
     * @param pluginName Name of the calling module
     * @param message Message or error to log
     * @param error Error object to log with the message
     */
    stacktrace(pluginName: string, message: any, error: Error) {
        console.error(`%c[${pluginName}]%c ${message}\n\n%c`, this.#nameStyle, "color: red; font-weight: 700;", "color: red;", error);
    }

    /**
     * Logs an error message.
     *
     * @param pluginName Name of the calling module
     * @param messages Messages to log
     */
    error(pluginName: string, ...messages: any[]) {this.#_log(pluginName, messages, "error");}

    /**
     * Logs a warning message.
     *
     * @param pluginName Name of the calling module
     * @param messages Messages to log
     */
    warn(pluginName: string, ...messages: any[]) {this.#_log(pluginName, messages, "warn");}

    /**
     * Logs an informational message.
     *
     * @param pluginName Name of the calling module
     * @param messages Messages to log
     */
    info(pluginName: string, ...messages: any[]) {this.#_log(pluginName, messages, "info");}

    /**
     * Logs a message used for debugging purposes.
     *
     * @param pluginName Name of the calling module.
     * @param messages Messages to log
     */
    debug(pluginName: string, ...messages: any[]) {this.#_log(pluginName, messages, "debug");}

    /**
     * Logs a basic message.
     *
     * @param pluginName Name of the calling module.
     * @param messages Messages to log
     */
    log(pluginName: string, ...messages: any[]) {this.#_log(pluginName, messages);}

    /**
     * Logs strings using different console levels and a module label.
     *
     * @param pluginName Name of the calling module
     * @param messages Messages to log
     * @param type Type of log to use in console
     */
    #_log(pluginName: string, messages: any[], type: keyof typeof LogTypes = "log") {
        type = parseType(type);
        console[type](`%c[${pluginName}]%c`, this.#nameStyle, this.#messageStyle, ...messages);
    }
}

/**
 * `BoundLogger` is a helper class to log data in a nice and consistent way, with plugin scoping automatically supplied.
 * An instance is available on instances of {@link BdApi}.
 */
class BoundLogger {
    #pluginName = "";
    #nameStyle = "color: #3a71c1; font-weight: 700;";
    #messageStyle = "";

    /** @ignore */
    constructor(pluginName: string) {
        this.#pluginName = pluginName;
    }

    /**
     * Logs an error using a collapsed error group with stacktrace.
     *
     * @param message Message or error to log
     * @param error Error object to log with the message
     */
    stacktrace(message: any, error: Error) {
        console.error(`%c[${this.#pluginName}]%c ${message}\n\n%c`, this.#nameStyle, "color: red; font-weight: 700;", "color: red;", error);
    }

    /**
     * Logs an error message.
     *
     * @param messages Messages to log
     */
    error(...messages: any[]) {this.#_log(messages, "error");}

    /**
     * Logs a warning message.
     *
     * @param messages Messages to log
     */
    warn(...messages: any[]) {this.#_log(messages, "warn");}

    /**
     * Logs an informational message.
     *
     * @param messages Messages to log
     */
    info(...messages: any[]) {this.#_log(messages, "info");}

    /**
     * Logs a message used for debugging purposes.
     *
     * @param messages Messages to log
     */
    debug(...messages: any[]) {this.#_log(messages, "debug");}

    /**
     * Logs a basic message.
     *
     * @param messages Messages to log
     */
    log(...messages: any[]) {this.#_log(messages);}

    /**
     * Logs strings using different console levels and a module label.
     *
     * @param messages Messages to log
     * @param type Type of log to use in console
     */
    #_log(messages: any[], type: keyof typeof LogTypes = "log") {
        type = parseType(type);
        console[type](`%c[${this.#pluginName}]%c`, this.#nameStyle, this.#messageStyle, ...messages);
    }
}


Object.freeze(Logger);
Object.freeze(Logger.prototype);

export {Logger, BoundLogger};