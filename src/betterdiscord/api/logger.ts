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
 */
class Logger<Bounded extends boolean> {

    #pluginName = "";
    #nameStyle = "color: #3a71c1; font-weight: 700;";
    #messageStyle = "";

    /**
     * @param pluginName Name of the plugin
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
     * @param pluginName Name of the calling module
     * @param message Message or error to log
     * @param error Error object to log with the message
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
     * @param pluginName Name of the calling module
     * @param message Messages to log
     */
    error(...messages: LogArgs<Bounded>) {this.#_log(messages, "error");}

    /**
     * Logs a warning message.
     *
     * @param pluginName Name of the calling module
     * @param message Messages to log
     */
    warn(...messages: LogArgs<Bounded>) {this.#_log(messages, "warn");}

    /**
     * Logs an informational message.
     *
     * @param pluginName Name of the calling module
     * @param message Messages to log
     */
    info(...messages: LogArgs<Bounded>) {this.#_log(messages, "info");}

    /**
     * Logs a message used for debugging purposes.
     *
     * @param pluginName Name of the calling module.
     * @param message Messages to log
     */
    debug(...args: LogArgs<Bounded>) {this.#_log(args, "debug");}

    /**
     * Logs a basic message.
     *
     * @param pluginName Name of the calling module.
     * @param message Messages to log
     */
    log(...messages: LogArgs<Bounded>) {this.#_log(messages);}

    /**
     * Logs strings using different console levels and a module label.
     *
     * @param module Name of the calling module
     * @param message Messages to log
     * @param type Type of log to use in console
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