import DOMManager from "@modules/dommanager";
import {getByKeys} from "@webpack";


export default class Notices {
    static get baseClass() {return this.__baseClass ??= getByKeys(["container", "base", "sidebar"])?.base;}
    static get errorPageClass() {return this.__errorPageClass ??= getByKeys(["errorPage"])?.errorPage;}

    /** Shorthand for `type = "info"` for {@link module:Notices.show} */
    static info(content, options = {}) {return this.show(content, Object.assign({}, options, {type: "info"}));}
    /** Shorthand for `type = "warning"` for {@link module:Notices.show} */
    static warn(content, options = {}) {return this.show(content, Object.assign({}, options, {type: "warning"}));}
    /** Shorthand for `type = "error"` for {@link module:Notices.show} */
    static error(content, options = {}) {return this.show(content, Object.assign({}, options, {type: "error"}));}
    /** Shorthand for `type = "success"` for {@link module:Notices.show} */
    static success(content, options = {}) {return this.show(content, Object.assign({}, options, {type: "success"}));}

    static createElement(type, options = {}, ...children) {
        const element = document.createElement(type);
        Object.assign(element, options);
        const filteredChildren = children.filter((n) => n);

        if (filteredChildren.length > 0) element.append(...filteredChildren);

        return element;
    }

    static joinClassNames(...classNames) {
        return classNames.filter((n) => n).join(" ");
    }

    /**
     * Show a notice above discord's chat layer.
     * @param {string} content Content of the notice
     * @param {object} options Options for the notice.
     * @param {string} [options.type="info" | "error" | "warning" | "success"] Type for the notice. Will affect the color.
     * @param {Array<{label: string, onClick: (immediately?: boolean = false) => void}>} [options.buttons] Buttons that should be added next to the notice text.
     * @param {number} [options.timeout=0] Timeout until the toast is closed. Won't fire if it's set to 0;
     * @returns {(immediately?: boolean = false) => void}
     */
    static show(content, options = {}) {
        const {type, buttons = [], timeout = 0, onClose = () => {}} = options;
        const haveContainer = this.ensureContainer();
        if (!haveContainer) return;

        const closeNotification = function (immediately = false) {
            onClose?.();
            // Immediately remove the notice without adding the closing class.
            if (immediately) return noticeElement.remove();

            noticeElement.classList.add("bd-notice-closing");
            setTimeout(() => {noticeElement.remove();}, 300);
        };

        const noticeElement = this.createElement("div", {
            className: this.joinClassNames("bd-notice", type && `bd-notice-${type}`),
        }, this.createElement("div", {
            className: "bd-notice-close",
            onclick: closeNotification.bind(null, false)
        }), this.createElement("span", {
            className: "bd-notice-content"
        }, content), ...buttons.map((button) => {
            if (!button || !button.label || typeof (button.onClick) !== "function") return null;

            return this.createElement("button", {
                className: "bd-notice-button",
                onclick: button.onClick.bind(null, closeNotification)
            }, button.label);
        }));

        document.getElementById("bd-notices").appendChild(noticeElement);

        if (timeout > 0) {
            setTimeout(closeNotification, timeout);
        }

        return closeNotification;
    }

    static ensureContainer() {
        if (document.getElementById("bd-notices")) return true;
        const container = document.querySelector(`.${this.baseClass}`);
        if (!container) return false;
        const noticeContainer = this.createElement("div", {
            id: "bd-notices"
        });
        container.prepend(noticeContainer);

        DOMManager.onRemoved(container, async () => {
            if (!this.errorPageClass) return;

            const element = await new Promise(res => DOMManager.onAdded(`.${this.errorPageClass}`, res));

            element.prepend(noticeContainer);
        });

        return true;
    }
}
