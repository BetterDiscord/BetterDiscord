import {Config} from "data";
import {Logger, WebpackModules, React, Settings, Strings, DOM, DiscordModules} from "modules";
import FormattableString from "../structs/string";

export default class Modals {

    static get shouldShowAddonErrors() {return Settings.get("settings", "addons", "addonErrors");}

    static get ModalActions() {return WebpackModules.getByProps("openModal", "updateModal");}
    static get ModalStack() {return WebpackModules.getByProps("push", "update", "pop", "popWithKey");}
    static get AlertModal() {return WebpackModules.getByPrototypes("handleCancel", "handleSubmit", "handleMinorConfirm");}
    static get TextElement() {return WebpackModules.getByProps("Sizes", "Weights");}
    static get ConfirmationModal() {return WebpackModules.findByDisplayName("ConfirmModal");}
    static get Markdown() {return WebpackModules.findByDisplayName("Markdown");}

    static default(title, content) {
        const modal = DOM.createElement(`<div class="bd-modal-wrapper theme-dark">
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
                        <div class="footer footer-2yfCgX footer-3rDWdC footer-2gL1pp">
                            <button type="button" class="bd-button">${Strings.Modals.okay}</button>
                        </div>
                    </div>
                </div>
            </div>`);
        modal.querySelector(".footer button").addEventListener("click", () => {
            modal.classList.add("closing");
            setTimeout(() => {modal.remove();}, 300);
        });
        modal.querySelector(".bd-backdrop").addEventListener("click", () => {
            modal.classList.add("closing");
            setTimeout(() => {modal.remove();}, 300);
        });
        document.querySelector("#app-mount").append(modal);
    }

    static alert(title, content) {
        this.showConfirmationModal(title, content, {cancelText: ""});
    }

    /**
     * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
     * @param {string} title - title of the modal
     * @param {(string|ReactElement|Array<string|ReactElement>)} children - a single or mixed array of react elements and strings. Everything is wrapped in Discord's `Markdown` component so strings will show and render properly.
     * @param {object} [options] - options to modify the modal
     * @param {boolean} [options.danger=false] - whether the main button should be red or not
     * @param {string} [options.confirmText=Okay] - text for the confirmation/submit button
     * @param {string} [options.cancelText=Cancel] - text for the cancel button
     * @param {callable} [options.onConfirm=NOOP] - callback to occur when clicking the submit button
     * @param {callable} [options.onCancel=NOOP] - callback to occur when clicking the cancel button
     * @param {string} [options.key] - key used to identify the modal. If not provided, one is generated and returned
     * @returns {string} - the key used for this modal
     */
    static showConfirmationModal(title, content, options = {}) {
        const Markdown = this.Markdown;
        const ConfirmationModal = this.ConfirmationModal;
        const ModalActions = this.ModalActions;
        if (content instanceof FormattableString) content = content.toString();
        if (!this.ModalActions || !this.ConfirmationModal || !this.Markdown) return this.default(title, content);

        const emptyFunction = () => {};
        const {onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = Strings.Modals.okay, cancelText = Strings.Modals.cancel, danger = false, key = undefined} = options;
        
        if (!Array.isArray(content)) content = [content];
        content = content.map(c => typeof(c) === "string" ? React.createElement(Markdown, null, c) : c);

        return ModalActions.openModal(props => {
            return React.createElement(ConfirmationModal, Object.assign({
                header: title,
                red: danger,
                confirmText: confirmText,
                cancelText: cancelText,
                onConfirm: onConfirm,
                onCancel: onCancel
            }, props), content);
        }, {modalKey: key});
    }

    static showAddonErrors({plugins: pluginErrors = [], themes: themeErrors = []}) {
        if (!pluginErrors || !themeErrors || !this.shouldShowAddonErrors) return;
        if (!pluginErrors.length && !themeErrors.length) return;
        const modal = DOM.createElement(`<div class="bd-modal-wrapper theme-dark">
                        <div class="bd-backdrop backdrop-1wrmKB"></div>
                        <div class="bd-modal bd-content-modal modal-1UGdnR">
                            <div class="bd-modal-inner inner-1JeGVc">
                                <div class="header header-1R_AjF"><div class="title">${Strings.Modals.addonErrors}</div></div>
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
                                    <div class="scroller-wrap fade">
                                        <div class="scroller">

                                        </div>
                                    </div>
                                </div>
                                <div class="footer footer-2yfCgX footer-3rDWdC footer-2gL1pp">
                                    <button type="button" class="bd-button">${Strings.Modals.okay}</button>
                                </div>
                            </div>
                        </div>
                    </div>`);

        const generateTab = function(errors) {
            const container = DOM.createElement(`<div class="errors">`);
            for (const err of errors) {
                const error = DOM.createElement(`<div class="error">
                                    <div class="table-column column-name">${err.name ? err.name : err.file}</div>
                                    <div class="table-column column-message">${err.message}</div>
                                    <div class="table-column column-error"><a class="error-link" href="">${err.error ? err.error.message : ""}</a></div>
                                </div>`);
                container.append(error);
                if (err.error) {
                    error.querySelectorAll("a").forEach(el => el.addEventListener("click", (e) => {
                        e.preventDefault();
                        Logger.stacktrace("AddonError", `Error details for ${err.name ? err.name : err.file}.`, err.error);
                    }));
                }
            }
            return container;
        };

        const tabs = [generateTab(pluginErrors), generateTab(themeErrors)];

        modal.querySelectorAll(".tab-bar-item").forEach(el => el.addEventListener("click", (e) => {
            e.preventDefault();
            const selected = modal.querySelector(".tab-bar-item.selected");
            if (selected) DOM.removeClass(selected, "selected");
            DOM.addClass(e.target, "selected");
            const scroller = modal.querySelector(".scroller");
            scroller.innerHTML = "";
            scroller.append(tabs[DOM.index(e.target)]);
        }));

        modal.querySelector(".footer button").addEventListener("click", () => {
            DOM.addClass(modal, "closing");
            setTimeout(() => {modal.remove();}, 300);
        });
        modal.querySelector(".bd-backdrop").addEventListener("click", () => {
            DOM.addClass(modal, "closing");
            setTimeout(() => {modal.remove();}, 300);
        });
        DOM.query("#app-mount").append(modal);
        if (pluginErrors.length) modal.querySelector(".tab-bar-item").click();
        else modal.querySelectorAll(".tab-bar-item")[1].click();
    }

    static showChangelogModal(options = {}) {
        const ModalStack = WebpackModules.getByProps("push", "update", "pop", "popWithKey");
        const ChangelogClasses = WebpackModules.getByProps("fixed", "improved");
        const TextElement = WebpackModules.findByDisplayName("Text");
        const FlexChild = WebpackModules.getByProps("Child");
        const Titles = WebpackModules.getByProps("Tags", "default");
        const Changelog = WebpackModules.getModule(m => m.defaultProps && m.defaultProps.selectable == false);
        const MarkdownParser = WebpackModules.getByProps("defaultRules", "parse");
        if (!Changelog || !ModalStack || !ChangelogClasses || !TextElement || !FlexChild || !Titles || !MarkdownParser) return Logger.warn("Modals", "showChangelogModal missing modules");
    
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
                ce(TextElement, {size: TextElement.Sizes.SMALL, color: TextElement.Colors.STANDARD, className: ChangelogClasses.date}, subtitle)
            );
        };
    
        const renderFooter = () => {
            const Anchor = WebpackModules.getModule(m => m.displayName == "Anchor");
            const AnchorClasses = WebpackModules.getByProps("anchorUnderlineOnHover") || {anchor: "anchor-3Z-8Bb", anchorUnderlineOnHover: "anchorUnderlineOnHover-2ESHQB"};
            const joinSupportServer = (click) => {
                click.preventDefault();
                click.stopPropagation();
                ModalStack.pop();
                DiscordModules.InviteActions.acceptInviteAndTransitionToInviteChannel("2HScm8j");
            };
            const supportLink = Anchor ? ce(Anchor, {onClick: joinSupportServer}, "Join our Discord Server.") : ce("a", {className: `${AnchorClasses.anchor} ${AnchorClasses.anchorUnderlineOnHover}`, onClick: joinSupportServer}, "Join our Discord Server.");
            const defaultFooter = ce(TextElement, {size: TextElement.Sizes.SMALL, color: TextElement.Colors.STANDARD}, "Need support? ", supportLink);
            return ce(FlexChild.Child, {grow: 1, shrink: 1}, footer ? footer : defaultFooter);
        };
    
        return ModalStack.push(Changelog, {
            className: ChangelogClasses.container,
            selectable: true,
            onScroll: _ => _,
            onClose: _ => _,
            renderHeader: renderHeader,
            renderFooter: renderFooter,
            children: changelogItems
        });
    }
}