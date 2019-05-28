function Core(config) {
    window.bdConfig = config;
}

Core.prototype.init = async function() {
    if (bdConfig.version < minSupportedVersion) {
        this.alert("Not Supported", "BetterDiscord v" + bdConfig.version + " (your version)" + " is not supported by the latest js (" + bbdVersion + ").<br><br> Please download the latest version from <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>GitHub</a>");
        return;
    }

    if (bdConfig.updater.LatestVersion > bdConfig.version) {
        this.alert("Update Available", `
            An update for BandagedBD is available (${bdConfig.updater.LatestVersion})! Please Reinstall!<br /><br />
            <a href='https://github.com/rauenzi/BetterDiscordApp/releases/latest' target='_blank'>Download Installer</a>
        `);
    }

    Utils.log("Startup", "Initializing Settings");
    this.initSettings();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();
    Utils.log("Startup", "Initializing EmoteModule");
    window.emotePromise = emoteModule.init().then(() => {
        emoteModule.initialized = true;
        Utils.log("Startup", "Initializing QuickEmoteMenu");
        quickEmoteMenu.init();
    });
    publicServersModule = new V2_PublicServers();

    voiceMode = new VoiceMode();
    dMode = new devMode();

    this.injectExternals();

    await this.checkForGuilds();
    BDV2.initialize();
    Utils.log("Startup", "Updating Settings");
    settingsPanel = new V2_SettingsPanel();
    settingsPanel.initializeSettings();

    Utils.log("Startup", "Loading Plugins");
    pluginModule = new PluginModule();
    pluginModule.loadPlugins();

    Utils.log("Startup", "Loading Themes");
    themeModule = new ThemeModule();
    themeModule.loadThemes();

    $("#customcss").detach().appendTo(document.head);

    window.addEventListener("beforeunload", function() {
        if (settingsCookie["bda-dc-0"]) document.querySelector(".btn.btn-disconnect").click();
    });

    publicServersModule.initialize();

    emoteModule.autoCapitalize();

    Utils.log("Startup", "Removing Loading Icon");
    document.getElementsByClassName("bd-loaderv2")[0].remove();
    Utils.log("Startup", "Initializing Main Observer");
    this.initObserver();

    // Show loading errors
    if (settingsCookie["fork-ps-1"]) {
        Utils.log("Startup", "Collecting Startup Errors");
        this.showContentErrors({plugins: bdpluginErrors, themes: bdthemeErrors});
    }

    // if (!DataStore.getBDData(bbdVersion)) {
    //     BdApi.alert("BBD Updated!", ["Lots of things were fixed in this update like Public Servers, Minimal Mode, Dark Mode and 24 Hour Timestamps.", BdApi.React.createElement("br"), BdApi.React.createElement("br"), "Feel free to test them all out!"]);
    //     DataStore.setBDData(bbdVersion, true);
    // }
};

Core.prototype.checkForGuilds = function() {
    return new Promise(resolve => {
        const checkForGuilds = function() {
            const wrapper = BDV2.guildClasses.wrapper.split(" ")[0];
            const guild = BDV2.guildClasses.listItem.split(" ")[0];
            const blob = BDV2.guildClasses.blobContainer.split(" ")[0];
            if (document.querySelectorAll(`.${wrapper} .${guild} .${blob}`).length > 0) return resolve(bdConfig.deferLoaded = true);
            setTimeout(checkForGuilds, 100);
        };
        $(document).ready(function () {
            setTimeout(checkForGuilds, 100);
        });
    });
};

Core.prototype.injectExternals = async function() {
    await Utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.9/ace.js");
    if (require.original) window.require = require.original;
};

Core.prototype.initSettings = function () {
    DataStore.initialize();
    if (!DataStore.getSettingGroup("settings")) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    }
    else {
        this.loadSettings();
        $("<style id=\"customcss\">").text(atob(DataStore.getBDData("bdcustomcss"))).appendTo(document.head);
        for (var setting in defaultCookie) {
            if (settingsCookie[setting] == undefined) {
                settingsCookie[setting] = defaultCookie[setting];
                this.saveSettings();
            }
        }
    }
};

Core.prototype.saveSettings = function () {
    DataStore.setSettingGroup("settings", settingsCookie);
};

Core.prototype.loadSettings = function () {
    settingsCookie = DataStore.getSettingGroup("settings");
};

Core.prototype.initObserver = function () {
    const mainObserver = new MutationObserver((mutations) => {

        for (let i = 0, mlen = mutations.length; i < mlen; i++) {
            let mutation = mutations[i];
            if (typeof pluginModule !== "undefined") pluginModule.rawObserver(mutation);

            // if there was nothing added, skip
            if (!mutation.addedNodes.length || !(mutation.addedNodes[0] instanceof Element)) continue;

            let node = mutation.addedNodes[0];

            if (node.classList.contains("layer-3QrUeG")) {
                if (node.getElementsByClassName("guild-settings-base-section").length) node.setAttribute("layer-id", "server-settings");

                if (node.getElementsByClassName("socialLinks-3jqNFy").length) {
                    node.setAttribute("layer-id", "user-settings");
                    node.setAttribute("id", "user-settings");
                    if (!document.getElementById("bd-settings-sidebar")) settingsPanel.renderSidebar();
                }
            }

            // Emoji Picker
            if (node.classList.contains("popout-3sVMXz") && !node.classList.contains("popoutLeft-30WmrD") && node.getElementsByClassName("emojiPicker-3m1S-j").length) quickEmoteMenu.obsCallback(node);

        }
    });

    mainObserver.observe(document, {
        childList: true,
        subtree: true
    });
};

Core.prototype.inject24Hour = function() {
    if (this.cancel24Hour) return;

    const twelveHour = new RegExp(`([0-9]{1,2}):([0-9]{1,2})\\s(AM|PM)`);
    const convert = (data) => {
        if (!settingsCookie["bda-gs-6"]) return;
        const matched = data.returnValue.match(twelveHour);
        if (!matched || matched.length !== 4) return;
        if (matched[3] === "AM") return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "00" : matched[1].padStart(2, "0")}:${matched[2]}`);
        return data.returnValue = data.returnValue.replace(matched[0], `${matched[1] === "12" ? "12" : parseInt(matched[1]) + 12}:${matched[2]}`);
    };


    const cancelCozy = Utils.monkeyPatch(BDV2.TimeFormatter, "calendarFormat", {after: convert}); // Called in Cozy mode
    const cancelCompact = Utils.monkeyPatch(BDV2.TimeFormatter, "dateFormat", {after: convert}); // Called in Compact mode
    this.cancel24Hour = () => {cancelCozy(); cancelCompact();}; // Cancel both
};

Core.prototype.injectColoredText = function() {
    if (this.cancelColoredText) return;

    this.cancelColoredText = Utils.monkeyPatch(BDV2.MessageContentComponent.prototype, "render", {after: (data) => {
        if (!settingsCookie["bda-gs-7"]) return;
		Utils.monkeyPatch(data.returnValue.props, "children", {silent: true, after: ({returnValue}) => {
			const markup = returnValue.props.children[1];
			const roleColor = data.thisObject.props.message.colorString;
			if (markup && roleColor) markup.props.style = {color: roleColor};
			return returnValue;
		}});
    }});
};

Core.prototype.removeColoredText = function() {
    document.querySelectorAll(".markup-2BOw-j").forEach(elem => {
        elem.style.setProperty("color", "");
    });
};

Core.prototype.alert = function(title, content) {
    let modal = $(`<div class="bd-modal-wrapper theme-dark">
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
};

Core.prototype.showContentErrors = function({plugins: pluginErrors = [], themes: themeErrors = []}) {
    if (!pluginErrors || !themeErrors) return;
    if (!pluginErrors.length && !themeErrors.length) return;
    let modal = $(`<div class="bd-modal-wrapper theme-dark">
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
        let container = $(`<div class="errors">`);
        for (let err of errors) {
            let error = $(`<div class="error">
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

    let tabs = [generateTab(pluginErrors), generateTab(themeErrors)];

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
};

/**
 * This shows a toast similar to android towards the bottom of the screen.
 *
 * @param {string} content The string to show in the toast.
 * @param {object} options Options object. Optional parameter.
 * @param {string} options.type Changes the type of the toast stylistically and semantically. Choices: "", "info", "success", "danger"/"error", "warning"/"warn". Default: ""
 * @param {boolean} options.icon Determines whether the icon should show corresponding to the type. A toast without type will always have no icon. Default: true
 * @param {number} options.timeout Adjusts the time (in ms) the toast should be shown for before disappearing automatically. Default: 3000
 */
Core.prototype.showToast = function(content, options = {}) {
    if (!bdConfig.deferLoaded) return;
    if (!document.querySelector(".bd-toasts")) {
        let toastWrapper = document.createElement("div");
        toastWrapper.classList.add("bd-toasts");
        let boundingElement = document.querySelector(".chat-3bRxxu form, #friends, .noChannel-Z1DQK7, .activityFeed-28jde9");
        toastWrapper.style.setProperty("left", boundingElement ? boundingElement.getBoundingClientRect().left + "px" : "0px");
        toastWrapper.style.setProperty("width", boundingElement ? boundingElement.offsetWidth + "px" : "100%");
        toastWrapper.style.setProperty("bottom", (document.querySelector(".chat-3bRxxu form") ? document.querySelector(".chat-3bRxxu form").offsetHeight : 80) + "px");
        document.querySelector(".app, .app-2rEoOp").appendChild(toastWrapper);
    }
    const {type = "", icon = true, timeout = 3000} = options;
    let toastElem = document.createElement("div");
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
};