import {Config} from "data";
import {Logger, WebpackModules, Utilities, React, Settings, Strings} from "modules";

export default class Modals {

    static get shouldShowAddonErrors() {return Settings.get("settings", "addons", "addonErrors");}

    static get ModalStack() {return WebpackModules.getByProps("push", "update", "pop", "popWithKey");}
    static get AlertModal() {return WebpackModules.getByPrototypes("handleCancel", "handleSubmit", "handleMinorConfirm");}
    static get TextElement() {return WebpackModules.getByProps("Sizes", "Weights");}
    static get ConfirmationModal() {return WebpackModules.getModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");}

    static default(title, content) {
        const backdrop = WebpackModules.getByProps("backdrop") || {backdrop: "backdrop-1wrmKb"};
        const baseModalClasses = WebpackModules.getModule(m => m.modal && m.inner && !m.sizeMedium) || {modal: "modal-36zFtW", inner: "inner-2VEzy9"};
        const modalClasses = WebpackModules.getByProps("sizeMedium") || {modal: "backdrop-1wrmKb", sizeMedium: "sizeMedium-ctncE5", content: "content-2KoCOZ", header: "header-2nhbou", footer: "footer-30ewN8", close: "close-hhyjWJ", inner: "inner-2Z5QZX"};
        const modal = Utilities.parseHTML(`<div class="bd-modal-wrapper theme-dark">
                <div class="bd-backdrop ${backdrop.backdrop}"></div>
                <div class="bd-modal ${baseModalClasses.modal}">
                    <div class="bd-modal-inner ${baseModalClasses.inner}">
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
                        <div class="footer ${modalClasses.footer}">
                            <button type="button" class="bd-button">${Strings.Modals.okay}</button>
                        </div>
                    </div>
                </div>
            </div>`);
        modal.querySelector(".footer button").addEventListener("click", () => {
            modal.addClass("closing");
            setTimeout(() => { modal.remove(); }, 300);
        });
        modal.querySelector(".bd-backdrop").addEventListener("click", () => {
            modal.addClass("closing");
            setTimeout(() => { modal.remove(); }, 300);
        });
        document.querySelector("#app-mount").append(modal);
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
        if (typeof(content) == "string") content = TextElement.default({color: TextElement.Colors.PRIMARY, children: [content]});
        else if (Array.isArray(content)) content = TextElement.default({color: TextElement.Colors.PRIMARY, children: content});
        content = [content];

        const emptyFunction = () => {};
        ModalStack.push(function(props) {
            return React.createElement(ConfirmationModal, Object.assign({
                header: title,
                children: content,
                red: danger,
                confirmText: confirmText ? confirmText : Strings.Modals.okay,
                cancelText: cancelText ? cancelText : Strings.Modals.cancel,
                onConfirm: onConfirm ? onConfirm : emptyFunction,
                onCancel: onCancel ? onCancel : emptyFunction
            }, props));
        });
    }

    static showAddonErrors({plugins: pluginErrors = [], themes: themeErrors = []}) {
        if (!pluginErrors || !themeErrors || !this.shouldShowAddonErrors) return;
        if (!pluginErrors.length && !themeErrors.length) return;
        const backdrop = WebpackModules.getByProps("backdrop") || {backdrop: "backdrop-1wrmKb"};
        const baseModalClasses = WebpackModules.getModule(m => m.modal && m.inner && !m.sizeMedium) || {modal: "modal-36zFtW", inner: "inner-2VEzy9"};
        const modalClasses = WebpackModules.getByProps("sizeMedium") || {modal: "modal-3v8ziU", sizeMedium: "sizeMedium-ctncE5", content: "content-2KoCOZ", header: "header-2nhbou", footer: "footer-30ewN8", close: "close-hhyjWJ", inner: "inner-2Z5QZX"};
        const modal = $(`<div class="bd-modal-wrapper theme-dark">
                        <div class="bd-backdrop ${backdrop.backdrop}"></div>
                        <div class="bd-modal bd-content-modal ${baseModalClasses.modal}">
                            <div class="bd-modal-inner ${baseModalClasses.inner}">
                                <div class="header ${modalClasses.header}"><div class="title">${Strings.Modals.addonErrors}</div></div>
                                <div class="bd-modal-body">
                                    <div class="tab-bar-container">
                                        <div class="tab-bar TOP">
                                            <div class="tab-bar-item">${Strings.Panels.plugins}</div>
                                            <div class="tab-bar-item">${Strings.Panels.themes}</div>
                                        </div>
                                    </div>
                                    <div class="table-header">
                                        <div class="table-column column-name">${Strings.Modals.name}</div>
                                        <div class="table-column column-message">${Strings.Modals.message}</div>
                                        <div class="table-column column-error">${Strings.Modals.error}</div>
                                    </div>
                                    <div class="scroller-wrap fade ${modalClasses.content}">
                                        <div class="scroller">

                                        </div>
                                    </div>
                                </div>
                                <div class="footer ${modalClasses.footer}">
                                    <button type="button" class="bd-button">${Strings.Modals.okay}</button>
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
                        Logger.stacktrace("AddonError", `Error details for ${err.name ? err.name : err.file}.`, err.error);
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

    showChangelogModal(options = {}) {
        const ModalStack = WebpackModules.getByProps("push", "update", "pop", "popWithKey");
        const ChangelogClasses = WebpackModules.getByProps("fixed", "improved");
        const TextElement = WebpackModules.getByProps("Sizes", "Weights");
        const FlexChild = WebpackModules.getByProps("Child");
        const Titles = WebpackModules.getByProps("Tags", "default");
        const Changelog = WebpackModules.getModule(m => m.defaultProps && m.defaultProps.selectable == false);
        const MarkdownParser = WebpackModules.getByProps("defaultRules", "parse");
        if (!Changelog || !ModalStack || !ChangelogClasses || !TextElement || !FlexChild || !Titles || !MarkdownParser) return;
    
        const {image = "https://repository-images.githubusercontent.com/105473537/957b5480-7c26-11e9-8401-50fa820cbae5", description = "", changes = [], title = "BandagedBD", subtitle = `v${Config.bbdVersion}`, footer} = options;
        const ce = React.createElement;
        const changelogItems = [ce("img", {src: image})];
        if (description) changelogItems.push(ce("p", null, MarkdownParser.parse(description)));
        for (let c = 0; c < changes.length; c++) {
            const entry = changes[c];
            const type = ChangelogClasses[entry.type] ? ChangelogClasses[entry.type] : ChangelogClasses.added;
            const margin = c == 0 ? ChangelogClasses.marginTop : "";
            changelogItems.push(ce("h1", {className: `${type} ${margin}`,}, entry.title));
            const list = ce("ul", null, entry.items.map(i => ce("li", null, MarkdownParser.parse(i))));
            changelogItems.push(list);
        }
        const renderHeader = function() {
            return ce(FlexChild.Child, {grow: 1, shrink: 1},
                ce(Titles.default, {tag: Titles.Tags.H4}, title),
                ce(TextElement,{size: TextElement.Sizes.SMALL, color: TextElement.Colors.PRIMARY, className: ChangelogClasses.date}, subtitle)
            );
        };
    
        const renderFooter = () => {
            const Anchor = WebpackModules.getModule(m => m.displayName == "Anchor");
            const AnchorClasses = WebpackModules.getByProps("anchorUnderlineOnHover") || {anchor: "anchor-3Z-8Bb", anchorUnderlineOnHover: "anchorUnderlineOnHover-2ESHQB"};
            const joinSupportServer = (click) => {
                click.preventDefault();
                click.stopPropagation();
                ModalStack.pop();
                BDV2.joinBD2();
            };
            const supportLink = Anchor ? ce(Anchor, {onClick: joinSupportServer}, "Join our Discord Server.") : ce("a", {className: `${AnchorClasses.anchor} ${AnchorClasses.anchorUnderlineOnHover}`, onClick: joinSupportServer}, "Join our Discord Server.");
            const defaultFooter = ce(TextElement,{size: TextElement.Sizes.SMALL, color: TextElement.Colors.PRIMARY}, "Need support? ", supportLink);
            return ce(FlexChild.Child, {grow: 1, shrink: 1}, footer ? footer : defaultFooter);
        };
    
        ModalStack.push(function(props) {
            return ce(Changelog, Object.assign({
                className: ChangelogClasses.container,
                selectable: true,
                onScroll: _ => _,
                onClose: _ => _,
                renderHeader: renderHeader,
                renderFooter: renderFooter,
                children: changelogItems
            }, props));
        });
    }
}