import {bbdVersion, settingsCookie} from "../0globals";
import WebpackModules from "./webpackModules";
import BDV2 from "./v2";
import DOM from "./domtools";

export default class Utils {
    /** Document/window width */
    static get screenWidth() { return Math.max(document.documentElement.clientWidth, window.innerWidth || 0); }
    /** Document/window height */
    static get screenHeight() { return Math.max(document.documentElement.clientHeight, window.innerHeight || 0); }

    static get WindowConfigFile() {
        return this._windowConfigFile = null;
    }

    static getAllWindowPreferences() {
        return {
            transparent: settingsCookie["fork-wp-1"] || settingsCookie.transparency,
            frame: settingsCookie.frame
        };
    }
    
    static getWindowPreference(key) {
        if (key === "transparent") return settingsCookie["fork-wp-1"] || settingsCookie.transparency;
        if (key === "frame") return settingsCookie.frame;
        return null;
    }
    
    static setWindowPreference(key, value) {
        if (key === "transparent") return settingsCookie["fork-wp-1"] = settingsCookie.transparency = value;
        if (key === "frame") return settingsCookie.frame = value;
        return null;
    }

    static stripBOM(content) {
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }
        return content;
    }

    static getTextArea() {
        return DOM.query(".channelTextArea-rNsIhG textarea");
    }

    static insertText(textarea, text) {
        textarea.focus();
        textarea.selectionStart = 0;
        textarea.selectionEnd = textarea.value.length;
        document.execCommand("insertText", false, text);
    }

    static escapeID(id) {
        return id.replace(/^[^a-z]+|[^\w-]+/gi, "-");
    }

    static log(moduleName, message) {
        console.log(`%c[BandagedBD]%c [${moduleName}]%c ${message}`, "color: #3a71c1; font-weight: 700;", "color: #3a71c1;", "");
    }

    static warn(moduleName, message) {
        console.warn(`%c[BandagedBD]%c [${moduleName}]%c ${message}`, "color: #E8A400; font-weight: 700;", "color: #E8A400;", "");
    }

    static err(moduleName, message, error) {
        console.log(`%c[BandagedBD]%c [${moduleName}]%c ${message}`, "color: red; font-weight: 700;", "color: red;", "");
        if (error) {
            console.groupCollapsed("%cError: " + error.message, "color: red;");
            console.error(error.stack);
            console.groupEnd();
        }
    }

    /**
     * Format strings with placeholders (`{{placeholder}}`) into full strings.
     * Quick example: `PluginUtilities.formatString("Hello, {{user}}", {user: "Zerebos"})`
     * would return "Hello, Zerebos".
     * @param {string} string - string to format
     * @param {object} values - object literal of placeholders to replacements
     * @returns {string} the properly formatted string
     */
    static formatString(string, values) {
        for (const val in values) {
            let replacement = values[val];
            if (Array.isArray(replacement)) replacement = JSON.stringify(replacement);
            if (typeof(replacement) === "object" && replacement !== null) replacement = replacement.toString();
            string = string.replace(new RegExp(`{{${val}}}`, "g"), replacement);
        }
        return string;
    }

    static escape(s) {
        return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    }

    static testJSON(data) {
        try {
            return JSON.parse(data);
        }
        catch (err) {
            return false;
        }
    }

    static isEmpty(obj) {
        if (obj == null || obj == undefined || obj == "") return true;
        if (typeof(obj) !== "object") return false;
        if (Array.isArray(obj)) return obj.length == 0;
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) return false;
        }
        return true;
    }

    static suppressErrors(method, message) {
        return (...params) => {
            try { return method(...params);	}
            catch (e) { this.err("SuppressedError", "Error occurred in " + message, e); }
        };
    }

    static monkeyPatch(what, methodName, options) {
        const {before, after, instead, once = false, silent = false, force = false} = options;
        const displayName = options.displayName || what.displayName || what[methodName].displayName || what.name || what.constructor.displayName || what.constructor.name;
        if (!silent) console.log("patch", methodName, "of", displayName); // eslint-disable-line no-console
        if (!what[methodName]) {
            if (force) what[methodName] = function() {};
            else return console.error(methodName, "does not exist for", displayName); // eslint-disable-line no-console
        }
        const origMethod = what[methodName];
        const cancel = () => {
            if (!silent) console.log("unpatch", methodName, "of", displayName); // eslint-disable-line no-console
            what[methodName] = origMethod;
        };
        what[methodName] = function() {
            const data = {
                thisObject: this,
                methodArguments: arguments,
                cancelPatch: cancel,
                originalMethod: origMethod,
                callOriginalMethod: () => data.returnValue = data.originalMethod.apply(data.thisObject, data.methodArguments)
            };
            if (instead) {
                const tempRet = Utils.suppressErrors(instead, "`instead` callback of " + what[methodName].displayName)(data);
                if (tempRet !== undefined) data.returnValue = tempRet;
            }
            else {
                if (before) Utils.suppressErrors(before, "`before` callback of " + what[methodName].displayName)(data);
                data.callOriginalMethod();
                if (after) Utils.suppressErrors(after, "`after` callback of " + what[methodName].displayName)(data);
            }
            if (once) cancel();
            return data.returnValue;
        };
        Object.assign(what[methodName], origMethod);
        what[methodName].__monkeyPatched = true;
        what[methodName].displayName = displayName;
        if (!what[methodName].__originalMethod) {
            what[methodName].__originalMethod = origMethod;
            what[methodName].toString = function() {return origMethod.toString();};
        }
        return cancel;
    }

    static onRemoved(node, callback) {
        const observer = new MutationObserver((mutations) => {
            for (let m = 0; m < mutations.length; m++) {
                const mutation = mutations[m];
                const nodes = Array.from(mutation.removedNodes);
                const directMatch = nodes.indexOf(node) > -1;
                const parentMatch = nodes.some(parent => parent.contains(node));
                if (directMatch || parentMatch) {
                    observer.disconnect();
                    callback();
                }
            }
        });

        observer.observe(document.body, {subtree: true, childList: true});
    }

    static getNestedProp(obj, path) {
        return path.split(/\s?\.\s?/).reduce(function(obj, prop) {
            return obj && obj[prop];
        }, obj);
    }

    /**
     * This shows a toast similar to android towards the bottom of the screen.
     *
     * @param {string} content The string to show in the toast.
     * @param {object} options Options object. Optional parameter.
     * @param {string} options.type Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: ""
     * @param {boolean} options.icon Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: true
     * @param {number} options.timeout Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
     */
    static showToast(content, options = {}) {
        if (!document.querySelector(".bd-toasts")) {
            const container = document.querySelector(".sidebar-2K8pFh + div") || null;
            const memberlist = container ? container.querySelector(".membersWrap-2h-GB4") : null;
            const form = container ? container.querySelector("form") : null;
            const left = container ? container.getBoundingClientRect().left : 310;
            const right = memberlist ? memberlist.getBoundingClientRect().left : 0;
            const width = right ? right - container.getBoundingClientRect().left : Utils.screenWidth - left - 240;
            const bottom = form ? form.offsetHeight : 80;
            const toastWrapper = document.createElement("div");
            toastWrapper.classList.add("bd-toasts");
            toastWrapper.style.setProperty("left", left + "px");
            toastWrapper.style.setProperty("width", width + "px");
            toastWrapper.style.setProperty("bottom", bottom + "px");
            document.querySelector("#app-mount").appendChild(toastWrapper);
        }
        const {type = "", icon = true, timeout = 3000} = options;
        const toastElem = document.createElement("div");
        toastElem.classList.add("bd-toast");
        if (type) toastElem.classList.add("toast-" + type);
        if (type && icon) toastElem.classList.add("icon");
        toastElem.innerText = content;
        document.querySelector(".bd-toasts").appendChild(toastElem);
        setTimeout(() => {
            toastElem.classList.add("closing");
            setTimeout(() => {
                toastElem.remove();
                if (!document.querySelectorAll(".bd-toasts .bd-toast").length) document.querySelector(".bd-toasts").remove();
            }, 300);
        }, timeout);
    }

    static alert(title, content) {
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
                                    <button type="button">Okay</button>
                                </div>
                            </div>
                        </div>
                    </div>`);
        modal.querySelector(".footer button").addEventListener("click", () => {
            DOM.addClass(modal, "closing");
            setTimeout(() => { modal.remove(); }, 300);
        });
        modal.querySelector(".bd-backdrop").addEventListener("click", () => {
            DOM.addClass(modal, "closing");
            setTimeout(() => { modal.remove(); }, 300);
        });
        DOM.query("#app-mount").append(modal);
    }

    static showContentErrors({plugins: pluginErrors = [], themes: themeErrors = []}) {
        if (!pluginErrors || !themeErrors) return;
        if (!pluginErrors.length && !themeErrors.length) return;
        const modal = DOM.createElement(`<div class="bd-modal-wrapper theme-dark">
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
                                <div class="footer footer-2yfCgX footer-3rDWdC footer-2gL1pp">
                                    <button type="button">Okay</button>
                                </div>
                            </div>
                        </div>
                    </div>`);
    
        function generateTab(errors) {
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
                        Utils.err("ContentManager", `Error details for ${err.name ? err.name : err.file}.`, err.error);
                    }));
                }
            }
            return container;
        }
    
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
            setTimeout(() => { modal.remove(); }, 300);
        });
        modal.querySelector(".bd-backdrop").addEventListener("click", () => {
            DOM.addClass(modal, "closing");
            setTimeout(() => { modal.remove(); }, 300);
        });
        DOM.query("#app-mount").append(modal);
        if (pluginErrors.length) modal.querySelector(".tab-bar-item").click();
        else modal.querySelectorAll(".tab-bar-item")[1].click();
    }

    static showChangelogModal(options = {}) {
        const ModalStack = WebpackModules.findByProps("push", "update", "pop", "popWithKey");
        const ChangelogClasses = WebpackModules.findByProps("fixed", "improved");
        const TextElement = WebpackModules.findByDisplayName("Text");
        const FlexChild = WebpackModules.findByProps("Child");
        const Titles = WebpackModules.findByProps("Tags", "default");
        const Changelog = WebpackModules.find(m => m.defaultProps && m.defaultProps.selectable == false);
        const MarkdownParser = WebpackModules.findByProps("defaultRules", "parse");
        if (!Changelog || !ModalStack || !ChangelogClasses || !TextElement || !FlexChild || !Titles || !MarkdownParser) return;
    
        const {image = "https://repository-images.githubusercontent.com/105473537/957b5480-7c26-11e9-8401-50fa820cbae5", description = "", changes = [], title = "BandagedBD", subtitle = `v${bbdVersion}`, footer} = options;
        const ce = BDV2.React.createElement;
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
                ce(TextElement,{size: TextElement.Sizes.SMALL, color: TextElement.Colors.STANDARD, className: ChangelogClasses.date}, subtitle)
            );
        };
    
        const renderFooter = () => {
            const Anchor = WebpackModules.find(m => m.displayName == "Anchor");
            const AnchorClasses = WebpackModules.findByProps("anchorUnderlineOnHover") || {anchor: "anchor-3Z-8Bb", anchorUnderlineOnHover: "anchorUnderlineOnHover-2ESHQB"};
            const joinSupportServer = (click) => {
                click.preventDefault();
                click.stopPropagation();
                ModalStack.pop();
                BDV2.joinBD2();
            };
            const supportLink = Anchor ? ce(Anchor, {onClick: joinSupportServer}, "Join our Discord Server.") : ce("a", {className: `${AnchorClasses.anchor} ${AnchorClasses.anchorUnderlineOnHover}`, onClick: joinSupportServer}, "Join our Discord Server.");
            const defaultFooter = ce(TextElement,{size: TextElement.Sizes.SMALL, color: TextElement.Colors.STANDARD}, "Need support? ", supportLink);
            return ce(FlexChild.Child, {grow: 1, shrink: 1}, footer ? footer : defaultFooter);
        };

        return ModalStack.push(function(props) {
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

    /**
     * Shows a generic but very customizable confirmation modal with optional confirm and cancel callbacks.
     * @param {string} title - title of the modal
     * @param {(string|ReactElement|Array<string|ReactElement>)} children - a single or mixed array of react elements and strings. Every string is wrapped in Discord's `Markdown` component so strings will show and render properly.
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
        const ModalActions = WebpackModules.findByProps("openModal", "updateModal");
        const Markdown = WebpackModules.findByDisplayName("Markdown");
        const ConfirmationModal = WebpackModules.findByDisplayName("ConfirmModal");
        if (!ModalActions || !ConfirmationModal || !Markdown) return Utils.alert(title, content);

        const emptyFunction = () => {};
        const {onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = "Okay", cancelText = "Cancel", danger = false, key = undefined} = options;

        if (!Array.isArray(content)) content = [content];
        content = content.map(c => typeof(c) === "string" ? BDV2.React.createElement(Markdown, null, c) : c);
        return ModalActions.openModal(props => {
            return BDV2.React.createElement(ConfirmationModal, Object.assign({
                header: title,
                red: danger,
                confirmText: confirmText,
                cancelText: cancelText,
                onConfirm: onConfirm,
                onCancel: onCancel
            }, props), content);
        }, {modalKey: key});
    }
}

Utils.showToast = Utils.suppressErrors(Utils.showToast, "Could not show toast.");