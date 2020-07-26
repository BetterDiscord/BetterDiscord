module.exports = class Logger {
    static stacktrace(message, error) {console.error(`%c[Injector]%c ${message}\n\n%c`, "color: #3a71c1; font-weight: 700;", "color: red; font-weight: 700;", "color: red;", error);}
    static err(...message) {Logger._log(message, "error");}
    static warn(...message) {Logger._log(message, "warn");}
    static info(...message) {Logger._log(message, "info");}
    static debug(...message) {Logger._log(message, "debug");}
    static log(...message) {Logger._log(message);}

    static _log(message, type = "log") {
        if (!Array.isArray(message)) message = [message];
        console[type](`%c[BetterDiscord]%c [Injector]%c`, "color: #3E82E5; font-weight: 700;", "color: #3a71c1;", "", ...message);
    }
};