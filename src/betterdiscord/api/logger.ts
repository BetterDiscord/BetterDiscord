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

    /**
     * @param nameStyle CSS to style the plugin name
     * @param messageStyle CSS to style the main message
     */
    constructor(nameStyle?: string, messageStyle?: string) {
        if (nameStyle) this.#nameStyle = nameStyle;
        if (messageStyle) this.#messageStyle = messageStyle;
    }

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
     * @param message Messages to log
     */
    error(name: string, ...messages: any[]) {this.#_log(name, messages, "error");}

    /**
     * Logs a warning message.
     *
     * @param pluginName Name of the calling module
     * @param message Messages to log
     */
    warn(name: string, ...messages: any[]) {this.#_log(name, messages, "warn");}

    /**
     * Logs an informational message.
     *
     * @param pluginName Name of the calling module
     * @param message Messages to log
     */
    info(name: string, ...messages: any[]) {this.#_log(name, messages, "info");}

    /**
     * Logs a message used for debugging purposes.
     *
     * @param pluginName Name of the calling module.
     * @param message Messages to log
     */
    debug(name: string, ...messages: any[]) {this.#_log(name, messages, "debug");}

    /**
     * Logs a basic message.
     *
     * @param pluginName Name of the calling module.
     * @param message Messages to log
     */
    log(name: string, ...messages: any[]) {this.#_log(name, messages);}

    /**
     * Logs strings using different console levels and a module label.
     *
     * @param module Name of the calling module
     * @param message Messages to log
     * @param type Type of log to use in console
     */
    #_log(name: string, messages: any[], type: keyof typeof LogTypes = "log") {
        type = parseType(type);
        console[type](`%c[${name}]%c`, this.#nameStyle, this.#messageStyle, ...messages);
    }
}

class BoundLogger {
    #pluginName = "";
    #nameStyle = "color: #3a71c1; font-weight: 700;";
    #messageStyle = "";

    /**
     * @param nameStyle CSS to style the plugin name
     * @param messageStyle CSS to style the main message
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
     * @param message Message or error to log
     * @param error Error object to log with the message
     */
    stacktrace(message: any, error: Error) {
        console.error(`%c[${this.#pluginName}]%c ${message}\n\n%c`, this.#nameStyle, "color: red; font-weight: 700;", "color: red;", error);
    }

    /**
     * Logs an error message.
     *
     * @param message Messages to log
     */
    error(...messages: any[]) {this.#_log(messages, "error");}

    /**
     * Logs a warning message.
     *
     * @param message Messages to log
     */
    warn(...messages: any[]) {this.#_log(messages, "warn");}

    /**
     * Logs an informational message.
     *
     * @param message Messages to log
     */
    info(...messages: any[]) {this.#_log(messages, "info");}

    /**
     * Logs a message used for debugging purposes.
     *
     * @param message Messages to log
     */
    debug(...messages: any[]) {this.#_log(messages, "debug");}

    /**
     * Logs a basic message.
     *
     * @param message Messages to log
     */
    log(...messages: any[]) {this.#_log(messages);}

    /**
     * Logs strings using different console levels and a module label.
     *
     * @param message Messages to log
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