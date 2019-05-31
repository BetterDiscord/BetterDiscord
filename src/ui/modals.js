import {Utilities, WebpackModules, React} from "modules";

export default class Modals {

    static get ModalStack() {return WebpackModules.getByProps("push", "update", "pop", "popWithKey");}
    static get AlertModal() {return WebpackModules.getByPrototypes("handleCancel", "handleSubmit", "handleMinorConfirm");}
    static get TextElement() {return WebpackModules.getByProps("Sizes", "Weights");}
    static get ConfirmationModal() {return WebpackModules.getModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");}

    static default(title, content) {
        const modal = $(`<div class="bd-modal-wrapper theme-dark">
                <div class="bd-backdrop backdrop-1wrmKB"></div>
                <div class="bd-modal modal-1UGdnR">
                    <div class="bd-modal-inner inner-1JeGVc">
                        <div class="header header-1R_AjF">
                            <div class="title">${title}</div>
                        </div>
                        <div class="bd-modal-body">
                            <div class="scroller-wrap fade">
                                <div class="scroller">
                                    ${content}
                                </div>
                            </div>
                        </div>
                        <div class="footer footer-2yfCgX">
                            <button type="button">Okay</button>
                        </div>
                    </div>
                </div>
            </div>`);
        modal.find(".footer button").on("click", () => {
        modal.addClass("closing");
        setTimeout(() => { modal.remove(); }, 300);
        });
        modal.find(".bd-backdrop").on("click", () => {
        modal.addClass("closing");
        setTimeout(() => { modal.remove(); }, 300);
        });
        modal.appendTo("#app-mount");
    }

    static alert(title, content) {
        if (this.ModalStack && this.AlertModal) return this.default(title, content);
        this.ModalStack.push(function(props) {
            return React.createElement(this.AlertModal, Object.assign({
                title: title,
                body: content,
            }, props));
        });
    }

    /**
     * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
     * @param {string} title - title of the modal
     * @param {(string|ReactElement|Array<string|ReactElement>)} children - a single or mixed array of react elements and strings. Everything is wrapped in Discord's `TextElement` component so strings will show and render properly.
     * @param {object} [options] - options to modify the modal
     * @param {boolean} [options.danger=false] - whether the main button should be red or not
     * @param {string} [options.confirmText=Okay] - text for the confirmation/submit button
     * @param {string} [options.cancelText=Cancel] - text for the cancel button
     * @param {callable} [options.onConfirm=NOOP] - callback to occur when clicking the submit button
     * @param {callable} [options.onCancel=NOOP] - callback to occur when clicking the cancel button
     */
    static showConfirmationModal(title, content, options = {}) {
        const TextElement = this.TextElement;
        const ConfirmationModal = this.ConfirmationModal;
        const ModalStack = this.ModalStack;
        if (!this.ModalStack || !this.ConfirmationModal || !this.TextElement) return this.alert(title, content);

        const {onConfirm, onCancel, confirmText, cancelText, danger = false} = options;
        if (typeof(content) == "string") content = TextElement({color: TextElement.Colors.PRIMARY, children: [content]});
        else if (Array.isArray(content)) content = TextElement({color: TextElement.Colors.PRIMARY, children: content});
        content = [content];

        const emptyFunction = () => {};
        ModalStack.push(function(props) {
            return React.createElement(ConfirmationModal, Object.assign({
                header: title,
                children: content,
                red: danger,
                confirmText: confirmText ? confirmText : "Okay",
                cancelText: cancelText ? cancelText : "Cancel",
                onConfirm: onConfirm ? onConfirm : emptyFunction,
                onCancel: onCancel ? onCancel : emptyFunction
            }, props));
        });
    }

    static showContentErrors({plugins: pluginErrors = [], themes: themeErrors = []}) {
        if (!pluginErrors || !themeErrors) return;
        if (!pluginErrors.length && !themeErrors.length) return;
        const modal = $(`<div class="bd-modal-wrapper theme-dark">
                        <div class="bd-backdrop backdrop-1wrmKB"></div>
                        <div class="bd-modal bd-content-modal modal-1UGdnR">
                            <div class="bd-modal-inner inner-1JeGVc">
                                <div class="header header-1R_AjF"><div class="title">Content Errors</div></div>
                                <div class="bd-modal-body">
                                    <div class="tab-bar-container">
                                        <div class="tab-bar TOP">
                                            <div class="tab-bar-item">Plugins</div>
                                            <div class="tab-bar-item">Themes</div>
                                        </div>
                                    </div>
                                    <div class="table-header">
                                        <div class="table-column column-name">Name</div>
                                        <div class="table-column column-message">Message</div>
                                        <div class="table-column column-error">Error</div>
                                    </div>
                                    <div class="scroller-wrap fade">
                                        <div class="scroller">

                                        </div>
                                    </div>
                                </div>
                                <div class="footer footer-2yfCgX">
                                    <button type="button">Okay</button>
                                </div>
                            </div>
                        </div>
                    </div>`);

        const generateTab = function(errors) {
            const container = $(`<div class="errors">`);
            for (const err of errors) {
                const error = $(`<div class="error">
                                    <div class="table-column column-name">${err.name ? err.name : err.file}</div>
                                    <div class="table-column column-message">${err.message}</div>
                                    <div class="table-column column-error"><a class="error-link" href="">${err.error ? err.error.message : ""}</a></div>
                                </div>`);
                container.append(error);
                if (err.error) {
                    error.find("a").on("click", (e) => {
                        e.preventDefault();
                        Utilities.err("ContentManager", `Error details for ${err.name ? err.name : err.file}.`, err.error);
                    });
                }
            }
            return container;
        };

        const tabs = [generateTab(pluginErrors), generateTab(themeErrors)];

        modal.find(".tab-bar-item").on("click", (e) => {
            e.preventDefault();
            modal.find(".tab-bar-item").removeClass("selected");
            $(e.target).addClass("selected");
            modal.find(".scroller").empty().append(tabs[$(e.target).index()]);
        });

        modal.find(".footer button").on("click", () => {
            modal.addClass("closing");
            setTimeout(() => { modal.remove(); }, 300);
        });
        modal.find(".bd-backdrop").on("click", () => {
            modal.addClass("closing");
            setTimeout(() => { modal.remove(); }, 300);
        });
        modal.appendTo("#app-mount");
        if (pluginErrors.length) modal.find(".tab-bar-item")[0].click();
        else modal.find(".tab-bar-item")[1].click();
    }
}