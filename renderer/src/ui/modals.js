import {Config} from "data";
import Logger from "common/logger";
import {WebpackModules, React, ReactDOM, Settings, Strings, DOMManager, DiscordModules, DiscordClasses} from "modules";
import FormattableString from "../structs/string";
import AddonErrorModal from "./addonerrormodal";
import ErrorBoundary from "./errorboundary";


export default class Modals {

    static get shouldShowAddonErrors() {return Settings.get("settings", "addons", "addonErrors");}

    static get ModalActions() {
        return this._ModalActions ??= {
            openModal: WebpackModules.getModule(m => m?.toString().includes("onCloseCallback") && m?.toString().includes("Layer"), {searchExports: true}),
            closeModal: WebpackModules.getModule(m => m?.toString().includes("onCloseCallback()"), {searchExports: true})
        };
    }
    static get ModalStack() {return this._ModalStack ??= WebpackModules.getByProps("push", "update", "pop", "popWithKey");}
    static get ModalComponents() {return this._ModalComponents ??= WebpackModules.getByProps("Header", "Footer");}
    static get ModalRoot() {return this._ModalRoot ??= WebpackModules.getModule(m => m?.toString?.()?.includes("ENTERING"), {searchExports: true});}
    static get ModalClasses() {return this._ModalClasses ??= WebpackModules.getByProps("modal", "content");}
    static get FlexElements() {return this._FlexElements ??= WebpackModules.getByProps("Child", "Align");}
    static get TextElement() {return this._TextElement ??= WebpackModules.getModule(m => m?.Sizes?.SIZE_32 && m.Colors);}
    static get ConfirmationModal() {return this._ConfirmationModal ??= WebpackModules.getModule(m => m?.toString?.()?.includes(".confirmButtonColor"));}
    static get Markdown() {return this._Markdown ??= WebpackModules.find(m => m?.prototype?.render && m.rules);}
    static get Buttons() {return this._Buttons ??= WebpackModules.getModule(m => m.BorderColors, {searchExports: true});}
    static get ModalQueue() {return this._ModalQueue ??= [];}
    
    static get hasModalOpen() {return !!document.getElementsByClassName("bd-modal").length;}

    static async initialize() {
        const names = ["ModalActions", "Markdown", "ModalRoot", "ModalComponents", "Buttons", "TextElement", "FlexElements"];

        for (const name of names) {
            const value = this[name];

            if (!value) {
                Logger.warn("Modals", `Missing ${name} module!`);
            }
        }
    }

    static default(title, content, buttons = []) {
        const modal = DOMManager.parseHTML(`<div class="bd-modal-wrapper theme-dark">
                <div class="bd-backdrop backdrop-1wrmKB"></div>
                <div class="bd-modal modal-1UGdnR">
                    <div class="bd-modal-inner inner-1JeGVc">
                        <div class="header header-1R_AjF">
                            <div class="title">${title}</div>
                        </div>
                        <div class="bd-modal-body">
                            <div class="scroller-wrap fade">
                                <div class="scroller"></div>
                            </div>
                        </div>
                        <div class="footer footer-2yfCgX footer-3rDWdC footer-2gL1pp"></div>
                    </div>
                </div>
            </div>`);
        
        const handleClose = () => {
            modal.classList.add("closing");
            setTimeout(() => {
                modal.remove();
                
                const next = this.ModalQueue.shift();
                if (!next) return;

                next();
            }, 300);
        };

        if (!buttons.length) {
            buttons.push({
                label: Strings.Modals.okay,
                action: handleClose
            });
        }

        const buttonContainer = modal.querySelector(".footer");
        for (const button of buttons) {
            const buttonEl = Object.assign(document.createElement("button"), {
                onclick: (e) => {
                    try {
                        button.action(e);
                    }
                    catch (error) {
                        Logger.stacktrace("Modals", "Could not fire button listener", error);
                    }

                    handleClose();
                },
                type: "button",
                className: "bd-button"
            });

            if (button.danger) buttonEl.classList.add("bd-button-danger");

            buttonEl.append(button.label);
            buttonContainer.appendChild(buttonEl);
        }

        if (Array.isArray(content) ? content.every(el => React.isValidElement(el)) : React.isValidElement(content)) {
            const container = modal.querySelector(".scroller");

            try {
                ReactDOM.render(content, container);
            }
            catch (error) {
                container.append(DOMManager.parseHTML(`<span style="color: red">There was an unexpected error. Modal could not be rendered.</span>`));
            }

            DOMManager.onRemoved(container, () => {
                ReactDOM.unmountComponentAtNode(container);
            });
        }
        else {
            modal.querySelector(".scroller").append(content);
        }
        
        modal.querySelector(".footer button").addEventListener("click", handleClose);
        modal.querySelector(".bd-backdrop").addEventListener("click", handleClose);
        
        const handleOpen = () => document.getElementById("app-mount").append(modal);

        if (this.hasModalOpen) {
            this.ModalQueue.push(handleOpen);
        }
        else {
            handleOpen();
        }
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

        const emptyFunction = () => {};
        const {onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = Strings.Modals.okay, cancelText = Strings.Modals.cancel, danger = false, key = undefined} = options;

        if (!this.ModalActions || !this.ConfirmationModal || !this.Markdown) {
            return this.default(title, content, [
                confirmText && {label: confirmText, action: onConfirm},
                cancelText && {label: cancelText, action: onCancel, danger}
            ].filter(Boolean));
        }

        if (!Array.isArray(content)) content = [content];
        content = content.map(c => typeof(c) === "string" ? React.createElement(Markdown, null, c) : c);

        const modalKey = ModalActions.openModal(props => {
            return React.createElement(ErrorBoundary, {
                onError: () => {
                    setTimeout(() => {
                        ModalActions.closeModal(modalKey);
                        this.default(title, content, [
                            confirmText && {label: confirmText, action: onConfirm},
                            cancelText && {label: cancelText, action: onCancel, danger}
                        ].filter(Boolean));
                    });
                }
            }, React.createElement(ConfirmationModal, Object.assign({
                header: title,
                confirmButtonColor: danger ? this.Buttons.Colors.RED : this.Buttons.Colors.BRAND,
                confirmText: confirmText,
                cancelText: cancelText,
                onConfirm: onConfirm,
                onCancel: onCancel
            }, props), React.createElement(ErrorBoundary, {}, content)));
        }, {modalKey: key});
        return modalKey;
    }

    static showAddonErrors({plugins: pluginErrors = [], themes: themeErrors = []}) {
        if (!pluginErrors || !themeErrors || !this.shouldShowAddonErrors) return;
        if (!pluginErrors.length && !themeErrors.length) return;
        
        if (this.addonErrorsRef && this.addonErrorsRef.current) {
            return this.addonErrorsRef.current.refreshTabs(Array.isArray(pluginErrors) ? pluginErrors : [], Array.isArray(themeErrors) ? themeErrors : []);
        }

        this.addonErrorsRef = React.createRef();
        this.ModalActions.openModal(props => React.createElement(ErrorBoundary, null, React.createElement(this.ModalRoot, Object.assign(props, {
            size: "medium",
            className: "bd-error-modal",
            children: [
                React.createElement(AddonErrorModal, {
                    ref: this.addonErrorsRef,
                    pluginErrors: Array.isArray(pluginErrors) ? pluginErrors : [],
                    themeErrors: Array.isArray(themeErrors) ? themeErrors : [],
                    onClose: props.onClose
                }),
                React.createElement(this.ModalComponents.Footer, {
                    className: "bd-error-modal-footer",
                }, React.createElement(this.Buttons, {
                    onClick: props.onClose,
                    className: "bd-button"
                }, Strings.Modals.okay))
            ]
        }))));
    }

    static showChangelogModal(options = {}) {
        const OriginalModalClasses = WebpackModules.getByProps("hideOnFullscreen", "root");
        const ChangelogModalClasses = WebpackModules.getModule(m => m.modal && m.maxModalWidth);
        const ChangelogClasses = WebpackModules.getByProps("fixed", "improved");
        const TextElement = this.TextElement;
        const FlexChild = this.FlexElements;
        const MarkdownParser = WebpackModules.getByProps("defaultRules", "parse");

        if (!OriginalModalClasses || !ChangelogModalClasses || !ChangelogClasses || !TextElement || !FlexChild || !MarkdownParser) return Logger.warn("Modals", "showChangelogModal missing modules");

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
            return ce(FlexChild, {className: OriginalModalClasses.header, grow: 0, shrink: 0, direction: FlexChild.Direction.VERTICAL},
                ce(TextElement, {tag: "h1", size: TextElement.Sizes.SIZE_20, strong: true}, title),
                ce(TextElement, {size: TextElement.Sizes.SIZE_12, color: TextElement.Colors.STANDARD, className: ChangelogClasses.date}, subtitle)
            );
        };

        const renderFooter = () => {
            const AnchorClasses = WebpackModules.getByProps("anchorUnderlineOnHover") || {anchor: "anchor-3Z-8Bb", anchorUnderlineOnHover: "anchorUnderlineOnHover-2ESHQB"};
            const joinSupportServer = (click) => {
                click.preventDefault();
                click.stopPropagation();
                DiscordModules.InviteActions.acceptInviteAndTransitionToInviteChannel({inviteKey: "0Tmfo5ZbORCRqbAd"});
            };
            const supportLink = ce("a", {className: `${AnchorClasses.anchor} ${AnchorClasses.anchorUnderlineOnHover}`, onClick: joinSupportServer}, "Join our Discord Server.");
            const defaultFooter = ce(TextElement, {size: TextElement.Sizes.SIZE_12, color: TextElement.Colors.STANDARD}, "Need support? ", supportLink);
            return ce(FlexChild, {className: OriginalModalClasses.footer + " " + OriginalModalClasses.footerSeparator},
                ce(FlexChild.Child, {grow: 1, shrink: 1}, footer ? footer : defaultFooter)
            );
        };

        const body = ce("div", {
            className: `${OriginalModalClasses.content} ${ChangelogClasses.container} ${ChangelogModalClasses.content} ${DiscordClasses.Scrollers.thin}`
        }, changelogItems);

        const key = this.ModalActions.openModal(props => {
            return React.createElement(ErrorBoundary, null, React.createElement(this.ModalRoot, Object.assign({
                className: `bd-changelog-modal ${OriginalModalClasses.root} ${OriginalModalClasses.small} ${ChangelogModalClasses.modal}`,
                selectable: true,
                onScroll: _ => _,
                onClose: _ => _,
            }, props), renderHeader(), body, renderFooter()));
        });
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
            return React.createElement(ErrorBoundary, {}, React.createElement(this.ModalRoot, Object.assign({size: mc.Sizes.MEDIUM, className: "bd-addon-modal" + " " + mc.Sizes.MEDIUM}, props),
                React.createElement(mc.Header, {separator: false, className: "bd-addon-modal-header"},
                    React.createElement(this.TextElement, {tag: "h1", size: this.TextElement.Sizes.SIZE_20, strong: true}, `${name} Settings`)
                ),
                React.createElement(mc.Content, {className: "bd-addon-modal-settings"},
                    React.createElement(ErrorBoundary, {}, child)
                ),
                React.createElement(mc.Footer, {className: "bd-addon-modal-footer"},
                    React.createElement(this.Buttons, {onClick: props.onClose, className: "bd-button"}, Strings.Modals.done)
                )
            ));
        };

        return this.ModalActions.openModal(props => {
            return React.createElement(ErrorBoundary, null, React.createElement(modal, props));
        });
    }
}
