/* eslint-disable no-console */

/**
 * List of logging types.
 */
enum LogTypes {
    ERROR = "error",
    DEBUG = "debug",
    LOG = "log",
    WARN = "warn",
    INFO = "info"
};

export default class Logger {

    /**
     * Logs an error using a collapsed error group with stacktrace.
     *
     * @param {string} module - Name of the calling module.
     * @param {string} message - Message or error to have logged.
     * @param {Error} error - Error object to log with the message.
     */
    static stacktrace(module: string, message: string, error: Error) {
        console.error(`%c[${module}]%c ${message}\n\n%c`, "color: #3a71c1; font-weight: 700;", "color: red; font-weight: 700;", "color: red;", error);
    }

    /**
     * Logs using error formatting. For logging an actual error object consider {@link module:Logger.stacktrace}
     *
     * @param {string} module - Name of the calling module.
     * @param {string} message - Messages to have logged.
     */
    static err(module: string, ...message: string[]) {Logger._log(module, message, LogTypes.ERROR);}

    /**
     * Alias for "err"
     * @param {string} module NAme of the calling module
     * @param  {...any} message Messages to have logged.
     */
    static error(module: string, ...message: string[]) {Logger._log(module, message, LogTypes.ERROR);}

    /**
     * Logs a warning message.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static warn(module: string, ...message: string[]) {Logger._log(module, message, LogTypes.WARN);}

    /**
     * Logs an informational message.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static info(module: string, ...message: string[]) {Logger._log(module, message, LogTypes.INFO);}

    /**
     * Logs used for debugging purposes.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static debug(module: string, ...message: string[]) {Logger._log(module, message, LogTypes.DEBUG);}

    /**
     * Logs used for basic loggin.
     *
     * @param {string} module - Name of the calling module.
     * @param {...any} message - Messages to have logged.
     */
    static log(module: string, ...message: string[]) {Logger._log(module, message);}

    /**
     * Logs strings using different console levels and a module label.
     *
     * @param {string} module - Name of the calling module.
     * @param {any|Array<any>} message - Messages to have logged.
     * @param {module:Logger.LogTypes} type - Type of log to use in console.
     */
    static _log(module: string, message: string|string[], type: LogTypes = LogTypes.LOG) {
        if (!Array.isArray(message)) message = [message];
        console[type](`%c[BetterDiscord]%c [${module}]%c`, "color: #3E82E5; font-weight: 700;", "color: #3a71c1;", "", ...message);
    }
}