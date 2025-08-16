import Logger from "@common/logger";
import Settings from "@stores/settings";
import React from "@modules/react";
import DOMManager from "@modules/dommanager";
import ReactDOM from "@modules/reactdom";
import ToastStore from "@stores/toasts";
import ToastContainer from "@ui/toasts/ToastContainer";
import type {ToastType} from "@ui/toasts/Toast";

import type {Root} from "react-dom/client";

export interface ToastOptions {
    type?: ToastType;
    icon?: boolean;
    timeout?: number;
    forceShow?: boolean;
}

class Toasts {
    private root: Root;
    private toastKey = 0;

    constructor() {
        const container = document.createElement("div");
        container.id = "bd-toasts";
        DOMManager.bdBody.appendChild(container);
        this.root = ReactDOM.createRoot(container);
        this.root.render(React.createElement(ToastContainer));
    }

    static get shouldShowToasts() {
        return Settings.get("settings", "general", "showToasts");
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

            if (!Toasts.shouldShowToasts && !forceShow) return;

            ToastStore.addToast({
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
}

export default new Toasts();