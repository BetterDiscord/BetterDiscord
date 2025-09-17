import Store from "@stores/base";
import Settings from "@stores/settings";
import Logger from "@common/logger";
import type {ToastProps, ToastType} from "@ui/toasts";

export interface ToastOptions {
    type?: ToastType;
    icon?: boolean;
    timeout?: number;
    forceShow?: boolean;
}

export default new class Toasts extends Store {
    private _toasts: ToastProps[] = [];
    private toastKey: number = 0;

    private get shouldShowToasts() {
        return Settings.get("settings", "general", "showToasts");
    }

    private addToast(toast: ToastProps) {
        this._toasts = [...this._toasts, toast];
        this.emitChange();

        setTimeout(() => {
            this.removeToast(toast.key);
        }, toast.timeout);
    }

    private removeToast(key: number) {
        this._toasts = this._toasts.filter(toast => toast.key !== key);
        this.emitChange();
    }

    get toasts(): ToastProps[] {
        return this._toasts;
    }

    /**
     * This shows a toast similar to android towards the bottom of the screen.
     *
     * @param {string} content The string to show in the toast.
     * @param {object} options Options object. Optional parameter.
     * @param {string} [options.type="default"] Changes the type of the toast stylistically and semantically. Choices: "default", "info", "success", "error", "warning". Default: "default"
     * @param {boolean} [options.icon=true] Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: true
     * @param {number} [options.timeout=3000] Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
     * @param {boolean} [options.forceShow=false] Whether to force showing the toast and ignore the bd setting
     */
    show(content: string, options: ToastOptions = {}) {
        try {
            const {type = "default", icon = true, timeout = 3000, forceShow = false} = options;

            if (!this.shouldShowToasts && !forceShow) return;

            this.addToast({
                key: this.toastKey++,
                content,
                type,
                icon,
                timeout,
            });
        }
        catch (err) {
            Logger.stacktrace("Toasts", "Unable to show toast", err as Error);
        }
    }

    /** Shorthand for `type = "default"` for {@link module:Toasts.show} */
    default(content: string, options: ToastOptions = {}) {
        return this.show(content, {...options, type: "default"});
    }

    /** Shorthand for `type = "info"` for {@link module:Toasts.show} */
    info(content: string, options: ToastOptions = {}) {
        return this.show(content, {...options, type: "info"});
    }

    /** Shorthand for `type = "success"` for {@link module:Toasts.show} */
    success(content: string, options: ToastOptions = {}) {
        return this.show(content, {...options, type: "success"});
    }

    /** Shorthand for `type = "warning"` for {@link module:Toasts.show} */
    warning(content: string, options: ToastOptions = {}) {
        return this.show(content, {...options, type: "warning"});
    }

    /** Shorthand for `type = "error"` for {@link module:Toasts.show} */
    error(content: string, options: ToastOptions = {}) {
        return this.show(content, {...options, type: "error"});
    }
};