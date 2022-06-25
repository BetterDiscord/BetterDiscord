import {Config} from "data";
import Logger from "common/logger";
import {WebpackModules, React, Settings, Strings, DOM, DiscordModules} from "modules";
import FormattableString from "../structs/string";
import AddonErrorModal from "./addonerrormodal";
import ErrorBoundary from "./errorboundary";

export default class Modals {

    static get shouldShowAddonErrors() {return Settings.get("settings", "addons", "addonErrors");}

    static get ModalActions() {return WebpackModules.getByProps("openModal", "updateModal");}
    static get ModalStack() {return WebpackModules.getByProps("push", "update", "pop", "popWithKey");}
    static get ModalComponents() {return WebpackModules.getByProps("ModalRoot");}
    static get ModalClasses() {return WebpackModules.getByProps("modal", "content");}
    static get AlertModal() {return WebpackModules.getByPrototypes("handleCancel", "handleSubmit", "handleMinorConfirm");}
    static get FlexElements() {return WebpackModules.getByProps("Child", "Align");}
    static get FormTitle() {return WebpackModules.findByDisplayName("FormTitle");}
    static get TextElement() {return WebpackModules.getByProps("Sizes", "Weights");}
    static get ConfirmationModal() {return WebpackModules.findByDisplayName("ConfirmModal");}
    static get Markdown() {return WebpackModules.find(m => m.displayName === "Markdown" && m.rules);}
    static get Buttons() {return WebpackModules.getByProps("ButtonSizes");}

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
        this.showConfirmationModal(title, content, {cancelText: null});
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
                confirmButtonColor: danger ? this.Buttons.ButtonColors.RED : this.Buttons.ButtonColors.BRAND,
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
        
        if (this.addonErrorsRef && this.addonErrorsRef.current) {
            return this.addonErrorsRef.current.refreshTabs(Array.isArray(pluginErrors) ? pluginErrors : [], Array.isArray(themeErrors) ? themeErrors : []);
        }

        this.addonErrorsRef = React.createRef();
        this.ModalActions.openModal(props => React.createElement(this.ModalComponents.ModalRoot, Object.assign(props, {
            size: "medium",
            className: "bd-error-modal",
            children: [
                React.createElement(AddonErrorModal, {
                    ref: this.addonErrorsRef,
                    pluginErrors: Array.isArray(pluginErrors) ? pluginErrors : [],
                    themeErrors: Array.isArray(themeErrors) ? themeErrors : [],
                    onClose: props.onClose
                }),
                React.createElement(this.ModalComponents.ModalFooter, {
                    className: "bd-error-modal-footer",
                }, React.createElement(this.Buttons.default, {
                    onClick: props.onClose,
                    className: "bd-button"
                }, Strings.Modals.okay))
            ]
        })));
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

        const {image = "https://i.imgur.com/wuh5yMK.png", description = "", changes = [], title = "BetterDiscord", subtitle = `v${Config.version}`, footer} = options;
        const ce = React.createElement;
        const changelogItems = [options.video ? ce("video", {src: options.video, poster: options.poster, controls: true, className: ChangelogClasses.video}) : ce("img", {src: image})];
        if (description) changelogItems.push(ce("p", null, MarkdownParser.parse(description)));
        for (let c = 0; c < changes.length; c++) {
            const entry = changes[c];
            const type = ChangelogClasses[entry.type] ? ChangelogClasses[entry.type] : ChangelogClasses.added;
            const margin = c == 0 ? ChangelogClasses.marginTop : "";
            changelogItems.push(ce("h1", {className: `${type} ${margin}`,}, entry.title));
            if (entry.description) changelogItems.push(ce("p", null, MarkdownParser.parse(entry.description)));
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
                DiscordModules.InviteActions.acceptInviteAndTransitionToInviteChannel("0Tmfo5ZbORCRqbAd");
            };
            const supportLink = Anchor ? ce(Anchor, {onClick: joinSupportServer}, "Join our Discord Server.") : ce("a", {className: `${AnchorClasses.anchor} ${AnchorClasses.anchorUnderlineOnHover}`, onClick: joinSupportServer}, "Join our Discord Server.");
            const defaultFooter = ce(TextElement, {size: TextElement.Sizes.SMALL, color: TextElement.Colors.STANDARD}, "Need support? ", supportLink);
            return ce(FlexChild.Child, {grow: 1, shrink: 1}, footer ? footer : defaultFooter);
        };

        const ModalActions = this.ModalActions;
        const OriginalModalClasses = WebpackModules.getByProps("hideOnFullscreen", "root");
        const originalRoot = OriginalModalClasses.root;
        if (originalRoot) OriginalModalClasses.root = `${originalRoot} bd-changelog-modal`;
        const key = ModalActions.openModal(props => {
            return React.createElement(Changelog, Object.assign({
                className: `bd-changelog ${ChangelogClasses.container}`,
                selectable: true,
                onScroll: _ => _,
                onClose: _ => _,
                renderHeader: renderHeader,
                renderFooter: renderFooter,
            }, props), changelogItems);
        });

        const closeModal = ModalActions.closeModal;
        ModalActions.closeModal = function(k) {
            Reflect.apply(closeModal, this, arguments);
            setTimeout(() => {if (originalRoot && k === key) OriginalModalClasses.root = originalRoot;}, 1000);
            ModalActions.closeModal = closeModal;
        };
        return key;
    }

    static showAddonSettingsModal(name, panel) {

        let child = panel;
        if (panel instanceof Node || typeof(panel) === "string") {
            child = class ReactWrapper extends React.Component {
                constructor(props) {
                    super(props);
                    this.elementRef = React.createRef();
                    this.element = panel;
                }

                componentDidMount() {
                    if (this.element instanceof Node) this.elementRef.current.appendChild(this.element);
                }

                render() {
                    const props = {
                        className: "bd-addon-settings-wrap",
                        ref: this.elementRef
                    };
                    if (typeof(this.element) === "string") props.dangerouslySetInnerHTML = {__html: this.element};
                    return React.createElement("div", props);
                }
            };
        }
        if (typeof(child) === "function") child = React.createElement(child);

        const mc = this.ModalComponents;
        const modal = props => {
            return React.createElement(mc.ModalRoot, Object.assign({size: mc.ModalSize.MEDIUM, className: "bd-addon-modal"}, props),
                React.createElement(mc.ModalHeader, {separator: false, className: "bd-addon-modal-header"},
                    React.createElement(this.FormTitle, {tag: "h4"}, `${name} Settings`)
                ),
                React.createElement(mc.ModalContent, {className: "bd-addon-modal-settings"},
                    React.createElement(ErrorBoundary, {}, child)
                ),
                React.createElement(mc.ModalFooter, {className: "bd-addon-modal-footer"},
                    React.createElement(this.Buttons.default, {onClick: props.onClose, className: "bd-button"}, Strings.Modals.done)
                )
            );
        };

        return this.ModalActions.openModal(props => {
            return React.createElement(modal, props);
        });
    }
}