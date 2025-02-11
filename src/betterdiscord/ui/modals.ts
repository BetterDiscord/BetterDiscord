import FormattableString from "@structs/string";

import Logger from "@common/logger";
import React from "@modules/react";
import ReactDOM from "@modules/reactdom";
import Strings from "@modules/strings";
import Settings from "@stores/settings";
import Events from "@modules/emitter";
import Patcher from "@modules/patcher";
import DiscordModules from "@modules/discordmodules";
import DOMManager from "@modules/dommanager";

import AddonErrorModal from "./modals/addonerrormodal";
import ErrorBoundary from "./errorboundary";
import TextElement from "./base/text";
import ModalRoot from "./modals/root";
// import ModalHeader from "./modals/header";
// import ModalContent from "./modals/content";
// import ModalFooter from "./modals/footer";

import Root from "./modals/root.jsx";
import ConfirmationModal, {type ConfirmationModalOptions} from "./modals/confirmation";
// import Button from "./base/button";
import CustomMarkdown from "./base/markdown";
import ChangelogModal from "./modals/changelog";
import ModalStack, {generateKey} from "./modals/stack";
import {Filters, getMangled} from "@webpack";
import type {ComponentType, ReactElement, RefObject} from "react";
import type AddonError from "@structs/addonerror";


const queue: Array<() => void> = [];

interface ModalActions {
    openModal: (e: () => ReactElement) => string | number;
    closeModal: (key: string | number) => void;
}

export default class Modals {

    static get shouldShowAddonErrors() {return Settings.get("settings", "addons", "addonErrors");}
    static get hasModalOpen() {return !!document.getElementsByClassName("bd-modal").length;}
    static get ModalQueue() {return queue;}

    static _ModalActions: ModalActions;
    static get ModalActions() {
        return this._ModalActions ??= getMangled("onCloseRequest:null!=", {
            openModal: Filters.byStrings("onCloseRequest:null!="),
            closeModal: Filters.byStrings(".setState", ".getState()[")
        }) as ModalActions;
    }

    static default(title: string, content: string | ReactElement | ReactElement[] | HTMLElement | Array<string | ReactElement>, buttons: Array<{danger?: boolean; label: string; action: (e?: MouseEvent) => void;}> = []) {
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
            </div>`) as HTMLElement;

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

        const buttonContainer = modal.querySelector(".footer")!;
        for (const button of buttons) {
            const buttonEl = Object.assign(document.createElement("button"), {
                onclick: (e: MouseEvent) => {
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
            const container = modal.querySelector(".scroller")!;

            try {
                // eslint-disable-next-line react/no-deprecated
                ReactDOM.render(content as ReactElement, container);
            }
            catch (error) {
                container.append(DOMManager.parseHTML(`<span style="color: red">There was an unexpected error. Modal could not be rendered.</span>`) as HTMLElement);
                Logger.stacktrace("Modals", "Could not render modal", error);
            }

            DOMManager.onRemoved(container, () => {
                // eslint-disable-next-line react/no-deprecated
                ReactDOM.unmountComponentAtNode(container);
            });
        }
        else {
            modal.querySelector(".scroller")!.append(content as Element);
        }

        modal.querySelector(".footer button")!.addEventListener("click", handleClose);
        modal.querySelector(".bd-backdrop")!.addEventListener("click", handleClose);

        const handleOpen = () => document.getElementById("app-mount")!.append(modal);

        if (this.hasModalOpen) {
            this.ModalQueue.push(handleOpen);
        }
        else {
            handleOpen();
        }
    }

    static alert(title: string, content: (string | ReactElement | Array<string | ReactElement>)) {
        this.showConfirmationModal(title, content, {cancelText: null});
    }

    /**
     * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
     * @param {string} title - title of the modal
     * @param {(string|ReactElement|Array<string|ReactElement>)} children - a single or mixed array of react elements and strings. Everything is wrapped in Discord's `Markdown` component so strings will show and render properly.
     * @param {object} [options] - options to modify the modal
     * @param {boolean} [options.danger=false] - whether the main button should be red or not
     * @param {string} [options.confirmText=Okay] - text for the confirmation/submit button
     * @param {string|null} [options.cancelText=Cancel] - text for the cancel button
     * @param {callable} [options.onConfirm=NOOP] - callback to occur when clicking the submit button
     * @param {callable} [options.onCancel=NOOP] - callback to occur when clicking the cancel button
     * @param {callable} [options.onClose=NOOP] - callback to occur when exiting the modal
     * @param {string} [options.key] - key used to identify the modal. If not provided, one is generated and returned
     * @returns {string} - the key used for this modal
     */
    static showConfirmationModal(title: string, content: (string | ReactElement | Array<string | ReactElement>), options: ConfirmationModalOptions = {}) {
        if (content instanceof FormattableString) content = content.toString();

        const emptyFunction = () => {};
        const {onClose = emptyFunction, onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = Strings.Modals.okay, cancelText = Strings.Modals.cancel, danger = false, key = undefined, size = Root.Sizes.SMALL} = options;

        if (!this.ModalActions) {
            return this.default(title, content, [
                confirmText && {label: confirmText, action: onConfirm},
                cancelText && {label: cancelText, action: onCancel, danger}
            ].filter(Boolean) as any);
        }

        if (!Array.isArray(content)) content = [content];
        content = content.map(c => typeof (c) === "string" ? React.createElement(CustomMarkdown, null, c) : c);

        const modalKey = this.openModal((props: any) => {
            return React.createElement(ErrorBoundary, {
                onError: () => {
                    setTimeout(() => {
                        this.ModalActions.closeModal(modalKey);
                        this.default(title, content, [
                            confirmText && {label: confirmText, action: onConfirm},
                            cancelText && {label: cancelText, action: onCancel, danger}
                        ].filter(Boolean) as any);
                    });
                }
            }, React.createElement(ConfirmationModal, Object.assign({
                header: title,
                danger: danger,
                confirmText: confirmText,
                cancelText: cancelText,
                onConfirm: onConfirm,
                onCancel: onCancel,
                className: size,
                onCloseCallback: () => {
                    if (props?.transitionState === 2) onClose?.();
                }
            }, props), React.createElement(ErrorBoundary, {id: "showConfirmationModal", name: "Modals"}, content)));
        }, {modalKey: key});
        return modalKey;
    }

    static showAddonErrors({plugins: pluginErrors = [], themes: themeErrors = []}: {plugins: AddonError[]; themes: AddonError[];}) {
        if (!pluginErrors || !themeErrors || !this.shouldShowAddonErrors) return;
        if (!pluginErrors.length && !themeErrors.length) return;

        const options = {
            pluginErrors: Array.isArray(pluginErrors) ? pluginErrors : [],
            themeErrors: Array.isArray(themeErrors) ? themeErrors : []
        };
        this.openModal(props => {
            return React.createElement(ErrorBoundary, {id: "showAddonErrors", name: "Modals"}, React.createElement(AddonErrorModal, Object.assign(options, props)));
        });
    }

    // TODO: move typing to changelog after converting
    static showChangelogModal(options: {
        transitionState?: number;
        footer?: string;
        title?: string;
        subtitle?: string;
        onClose?(): void;
        video?: string;
        poster?: string;
        banner?: string;
        blurb?: string;
        changes?: object;
    } = {}) {
        const key = this.openModal(props => {
            return React.createElement(ErrorBoundary, {id: "showChangelogModal", name: "Modals"}, React.createElement(ChangelogModal, Object.assign(options, props)));
        });
        return key;
    }

    /**
     * Shows the guild join modal, to join invites
     * @param {string} code
     */
    static async showGuildJoinModal(code: string) {
        const tester = /\.gg\/(.*)$/;
        if (tester.test(code)) code = code.match(tester)![1];

        const {invite} = await DiscordModules.InviteActions?.resolveInvite(code) ?? {invite: null};

        if (!invite) {
            Logger.debug("Utilities", "Failed to resolve invite:", code);
            return;
        }

        const minimize = Patcher.instead("BetterDiscord~showGuildJoinModal", DiscordModules.RemoteModule!, "minimize", () => {});
        const focus = Patcher.instead("BetterDiscord~showGuildJoinModal", DiscordModules.RemoteModule!, "focus", () => {});

        try {
            await DiscordModules.Dispatcher?.dispatch({
                type: "INVITE_MODAL_OPEN",
                invite,
                code,
                context: "APP"
            });
        }
        finally {
            minimize();
            focus();
        }
    }

    static showAddonSettingsModal(name: string, panel: Element | string | (() => ReactElement) | ReactElement | ComponentType) {

        let child = panel;
        if (panel instanceof Node || typeof (panel) === "string") {
            child = class ReactWrapper extends React.Component<any, {hasError: boolean;}> {
                element: Element | string;
                elementRef: RefObject<Element | string>;
                constructor(props?: any) {
                    super(props);
                    this.elementRef = React.createRef();
                    this.element = panel as (Element | string);
                    this.state = {hasError: false};
                }

                componentDidCatch() {
                    this.setState({hasError: true});
                }

                componentDidMount() {
                    if (this.element instanceof Node) (this.elementRef as RefObject<Element>).current?.appendChild(this.element as Element);
                }

                render() {
                    if (this.state.hasError) return React.createElement(TextElement, {color: TextElement.Colors.STATUS_RED}, Strings.Addons.settingsError);
                    return React.createElement("div", {
                        className: "bd-addon-settings-wrap",
                        ref: this.elementRef,
                        dangerouslySetInnerHTML: typeof (this.element) === "string" ? {__html: this.element} : undefined
                    });
                }
            };
        }
        if (typeof (child) === "function") child = React.createElement(child);

        const options = {
            className: "bd-addon-modal",
            size: ModalRoot.Sizes.MEDIUM,
            header: `${name} Settings`,
            cancelText: null,
            confirmText: Strings.Modals.done
        };

        return this.openModal((props: any) => {
            return React.createElement(ErrorBoundary, {id: "showAddonSettingsModal", name: "Modals"}, React.createElement(ConfirmationModal, Object.assign(options, props), child as ReactElement));
        });
    }

    static hasInitialized = false;
    static makeStack() {
        const div = DOMManager.parseHTML(`<div id="bd-modal-container">`) as HTMLElement;
        DOMManager.bdBody.append(div);
        // eslint-disable-next-line react/no-deprecated
        ReactDOM.render(
            [React.createElement(ErrorBoundary, {id: "makeStack", name: "Modals", hideError: true}, React.createElement(ModalStack))],
            // <ErrorBoundary id="makeStack" name="Modals" hideError={true}><ModalStack /></ErrorBoundary>,
            div
        );
        this.hasInitialized = true;
    }

    static openModal(render: (props?: unknown) => ReactElement, options: {modalKey?: string | number;} = {}) {
        if (typeof (this.ModalActions.openModal) === "function") return this.ModalActions.openModal(render);
        if (!this.hasInitialized) this.makeStack();
        options.modalKey = generateKey(options.modalKey);
        Events.emit("open-modal", render, options);
        return options.modalKey;
    }
}


Modals.makeStack();