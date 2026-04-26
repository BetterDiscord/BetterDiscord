import Store from "@stores/base";
import Settings from "@stores/settings";
import Logger from "@common/logger";
import type {ToastProps, ToastType} from "@ui/toasts";

export interface ToastOptions {
    /** Changes the type of the toast stylistically and semantically */
    type?: ToastType;
    /** Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. */
    icon?: boolean;
    /** Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Defaults to 3000. */
    timeout?: number;
    /** Whether to force showing the toast and ignore the BD setting */
    forceShow?: boolean;
}

class Toasts extends Store {
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
     * @param content The string to show in the toast.
     * @param options Options object. Optional parameter.
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

    /** Shorthand for `type = "default"` for {@link show} */
    default(content: string, options: ToastOptions = {}) {
        return this.show(content, {...options, type: "default"});
    }

    /** Shorthand for `type = "info"` for {@link show} */
    info(content: string, options: ToastOptions = {}) {
        return this.show(content, {...options, type: "info"});
    }

    /** Shorthand for `type = "success"` for {@link show} */
    success(content: string, options: ToastOptions = {}) {
        return this.show(content, {...options, type: "success"});
    }

    /** Shorthand for `type = "warning"` for {@link show} */
    warning(content: string, options: ToastOptions = {}) {
        return this.show(content, {...options, type: "warning"});
    }

    /** Shorthand for `type = "error"` for {@link show} */
    error(content: string, options: ToastOptions = {}) {
        return this.show(content, {...options, type: "error"});
    }
};

export default new Toasts();