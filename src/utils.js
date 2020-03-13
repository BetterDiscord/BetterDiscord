export default class Utils {
    /** Document/window width */
    static get screenWidth() { return Math.max(document.documentElement.clientWidth, window.innerWidth || 0); }
    /** Document/window height */
    static get screenHeight() { return Math.max(document.documentElement.clientHeight, window.innerHeight || 0); }

    static stripBOM(content) {
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }
        return content;
    }

    static getTextArea() {
        return $(".channelTextArea-rNsIhG textarea");
    }

    static insertText(textarea, text) {
        textarea.focus();
        textarea.selectionStart = 0;
        textarea.selectionEnd = textarea.value.length;
        document.execCommand("insertText", false, text);
    }

    static injectCss(uri) {
        $("<link/>", {
            type: "text/css",
            rel: "stylesheet",
            href: uri
        }).appendTo($("head"));
    }

    static injectJs(uri) {
        return new Promise(resolve => {
            $("<script/>", {
                type: "text/javascript",
                src: uri,
                onload: resolve
            }).appendTo($("body"));
        });
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
        // if (!bdConfig.deferLoaded) return;
        if (!document.querySelector(".bd-toasts")) {
            const toastWrapper = document.createElement("div");
            toastWrapper.classList.add("bd-toasts");
            const boundingElement = document.querySelector(".chat-3bRxxu form, #friends, .noChannel-Z1DQK7, .activityFeed-28jde9");
            toastWrapper.style.setProperty("left", boundingElement ? boundingElement.getBoundingClientRect().left + "px" : "0px");
            toastWrapper.style.setProperty("width", boundingElement ? boundingElement.offsetWidth + "px" : "100%");
            toastWrapper.style.setProperty("bottom", (document.querySelector(".chat-3bRxxu form") ? document.querySelector(".chat-3bRxxu form").offsetHeight : 80) + "px");
            document.querySelector(".app, .app-2rEoOp").appendChild(toastWrapper);
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
                                <div class="footer footer-2yfCgX footer-3rDWdC footer-2gL1pp">
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
    
        function generateTab(errors) {
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
                        Utils.err("ContentManager", `Error details for ${err.name ? err.name : err.file}.`, err.error);
                    });
                }
            }
            return container;
        }
    
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