import Logger from "@common/logger";

import Settings from "@stores/settings";

import DOMManager from "@modules/dommanager";
import {getByKeys} from "@webpack";


export type ToastType = "success" | "info" | "warning" | "error" | "default";

export interface ToastOptions {
    type?: ToastType;
    icon?: boolean;
    timeout?: number;
    forceShow?: boolean;
}

// TODO: rewrite this nonsense
export default class Toasts {

    static get ChannelsClass() {return getByKeys<{sidebar: string;}>(["sidebar", "panels"])!.sidebar.split(" ")[0];}
    static get MembersWrapClass() {return getByKeys<{membersWrap: string;}>(["membersWrap"])!.membersWrap.split(" ")[0];}

    static get shouldShowToasts() {return Settings.get("settings", "general", "showToasts");}

    /** Shorthand for `type = "success"` for {@link module:Toasts.show} */
    static async success(content: string, options: ToastOptions = {}) {return this.show(content, Object.assign(options, {type: "success"}));}

    /** Shorthand for `type = "info"` for {@link module:Toasts.show} */
    static async info(content: string, options: ToastOptions = {}) {return this.show(content, Object.assign(options, {type: "info"}));}

    /** Shorthand for `type = "warning"` for {@link module:Toasts.show} */
    static async warning(content: string, options: ToastOptions = {}) {return this.show(content, Object.assign(options, {type: "warning"}));}

    /** Shorthand for `type = "error"` for {@link module:Toasts.show} */
    static async error(content: string, options: ToastOptions = {}) {return this.show(content, Object.assign(options, {type: "error"}));}

    /** Shorthand for `type = "default"` for {@link module:Toasts.show} */
    static async default(content: string, options: ToastOptions = {}) {return this.show(content, Object.assign(options, {type: ""}));}

    /**
     * This shows a toast similar to android towards the bottom of the screen.
     *
     * @param {string} content The string to show in the toast.
     * @param {object} options Options object. Optional parameter.
     * @param {string} [options.type=""] Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: ""
     * @param {boolean} [options.icon=true] Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: true
     * @param {number} [options.timeout=3000] Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
     * @param {boolean} [options.forceShow=false] Whether to force showing the toast and ignore the bd setting
     */
    static show(content: string, options: ToastOptions = {}) {
        try {
            const {type = "", icon = true, timeout = 3000, forceShow = false} = options;
            if (!this.shouldShowToasts && !forceShow) return;
            this.ensureContainer();
            const toastElem = document.createElement("div");
            toastElem.classList.add("bd-toast");
            if (type) toastElem.classList.add("toast-" + type);
            if (type && icon) toastElem.classList.add("icon");
            toastElem.innerText = content;
            document.querySelector(".bd-toasts")!.appendChild(toastElem);
            setTimeout(() => {
                toastElem.classList.add("closing");
                setTimeout(() => {
                    toastElem.remove();
                    if (!document.querySelectorAll(".bd-toasts .bd-toast").length) document.querySelector(".bd-toasts")!.remove();
                }, 300);
            }, timeout);
        }
        catch (err) {
            Logger.stacktrace("Toasts", "Unable to show toast", err as Error);
        }
    }

    static ensureContainer() {
        if (document.querySelector(".bd-toasts")) return;
        const container = document.querySelector<HTMLDivElement>(`.${this.ChannelsClass} ~ div:not([style])`);
        const memberlist = container ? container.querySelector(`.${this.MembersWrapClass}`) : null;
        const form = container ? container.querySelector("form") : null;
        const left = container ? container.getBoundingClientRect().left : 310;
        const right = memberlist ? memberlist.getBoundingClientRect().left : 0;
        const width = right ? right - container!.getBoundingClientRect().left : (container?.offsetWidth ?? document.body.offsetWidth / 2);
        const bottom = form ? form.offsetHeight : 80;
        const toastWrapper = document.createElement("div");
        toastWrapper.classList.add("bd-toasts");
        toastWrapper.style.setProperty("left", left + "px");
        toastWrapper.style.setProperty("width", width + "px");
        toastWrapper.style.setProperty("bottom", bottom + "px");
        DOMManager.bdBody.appendChild(toastWrapper);
    }
}
