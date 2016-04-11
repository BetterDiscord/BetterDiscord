/* BetterDiscordApp Core JavaScript
 * Version: 1.53
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 02/04/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */

var BD;

var settingsPanel, emoteModule, utils, quickEmoteMenu, opublicServers, voiceMode, pluginModule, themeModule, customCssEditor;

var mainObserver;
var mainCore;
var settingsCookie = {};

function Core() {
    BD = this;
}

Core.prototype.init = function () {
    var self = this;
    this.version = version;
    this.jsVersion = jsVersion;
    if (this.version < supportedVersion) {
        this.alert("Not Supported", "BetterDiscord v" + this.version + "(your version)" + " is not supported by the latest js(" + this.jsVersion + ").<br><br> Please download the latest version from <a href='https://betterdiscord.net' target='_blank'>BetterDiscord.net</a>");
        return;
    }

    this.utils = new Utils();

    utils = new Utils();
    utils.getHash();
    emoteModule = new EmoteModule();
    quickEmoteMenu = new QuickEmoteMenu();
    voiceMode = new VoiceMode();

    emoteModule.init();

    this.initSettings();
    this.initObserver();

    //Incase were too fast
    function gwDefer() {
        console.log(new Date().getTime() + " Defer");
        if ($(".guilds-wrapper .guilds").children().length > 0) {
            console.log(new Date().getTime() + " Defer Loaded");
            var guilds = $(".guilds>li:first-child");

            var showChannelsButton = $("<button/>", {
                class: "btn",
                id: "bd-show-channels",
                text: "R",
                css: {
                    "cursor": "pointer"
                },
                click: function () {
                    settingsCookie["bda-gs-3"] = false;
                    $("body").removeClass("bd-minimal-chan");
                    self.saveSettings();
                }
            });

            $(".guilds-wrapper").prepend(showChannelsButton);

            opublicServers = new PublicServers();
            customCssEditor = new CustomCssEditor();
            pluginModule = new PluginModule();
            pluginModule.loadPlugins();
            if (typeof (themesupport2) !== "undefined") {
                themeModule = new ThemeModule();
                themeModule.loadThemes();
            }

            settingsPanel = new SettingsPanel();
            settingsPanel.init();

            quickEmoteMenu.init(false);

            $("#tc-settings-button").on("click", function () {
                settingsPanel.show();
            });
            
            window.addEventListener("beforeunload", function(){
                if(settingsCookie["bda-dc-0"]){
                    $('.btn.btn-disconnect').click();
                }
            });
            
            opublicServers.init();

            emoteModule.autoCapitalize();

            /*Display new features in BetterDiscord*/
            if (settingsCookie["version"] < jsVersion) {
                var cl = self.constructChangelog();
                $("body").append(cl);
                settingsCookie["version"] = jsVersion;
                self.saveSettings();
            }

            $("head").append("<style>.CodeMirror{ min-width:100%; }</style>");
            $("head").append('<style id="bdemotemenustyle"></style>');

        } else {
            setTimeout(gwDefer, 100);
        }
    }


    $(document).ready(function () {
        setTimeout(gwDefer, 1000);
    });
};

Core.prototype.initSettings = function () {
    if ($.cookie("better-discord") == undefined) {
        settingsCookie = defaultCookie;
        this.saveSettings();
    } else {
        this.loadSettings();

        for (var setting in defaultCookie) {
            if (settingsCookie[setting] == undefined) {
                settingsCookie[setting] = defaultCookie[setting];
                this.saveSettings();
            }
        }
    }
};

Core.prototype.saveSettings = function () {
    $.cookie("better-discord", JSON.stringify(settingsCookie), {
        expires: 365,
        path: '/'
    });
};

Core.prototype.loadSettings = function () {
    settingsCookie = JSON.parse($.cookie("better-discord"));
};

Core.prototype.initObserver = function () {
    mainObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if($(mutation.target).find(".emoji-picker").length) {
                var fc = mutation.target.firstChild;
                if(fc.classList.contains("popout")) {
                    quickEmoteMenu.obsCallback($(fc));
                }
            }
            if (typeof pluginModule !== "undefined") pluginModule.rawObserver(mutation);
            if (mutation.target.getAttribute('class') != null) {
                //console.log(mutation.target)
                if(mutation.target.classList.contains('title-wrap') || mutation.target.classList.contains('chat')){
                   // quickEmoteMenu.obsCallback();
                    voiceMode.obsCallback();
                    if (typeof pluginModule !== "undefined") pluginModule.channelSwitch();
                }
                if (mutation.target.getAttribute('class').indexOf('scroller messages') != -1) {
                    if (typeof pluginModule !== "undefined") pluginModule.newMessage();
                }
            }
            emoteModule.obsCallback(mutation);
        });
    });

    //noinspection JSCheckFunctionSignatures
    mainObserver.observe(document, {
        childList: true,
        subtree: true
    });
};

Core.prototype.constructChangelog = function () {
    var changeLog = '' +
        '<div id="bd-wn-modal" class="modal" style="opacity:1;">' +
        '  <div class="modal-inner">' +
        '       <div id="bdcl" class="markdown-modal change-log"> ' +
        '           <div class="markdown-modal-header">' +
        '               <strong>What\'s new in BetterDiscord JS' + jsVersion + '</strong>' +
        '               <button class="markdown-modal-close" onclick=\'$("#bd-wn-modal").remove();\'></button>' +
        '           </div><!--header-->' +
        '           <div class="scroller-wrap">' +
        '               <div class="scroller">';

    if (bdchangelog.changes != null) {
        changeLog += '' +
            '<h1 class="changelog-added">' +
            '   <span>New Stuff</span>' +
            '</h1>' +
            '<ul>';

        for (var change in bdchangelog.changes) {
            change = bdchangelog.changes[change];

            changeLog += '' +
                '<li>' +
                '   <strong>' + change.title + '</strong>' +
                '   <div>' + change.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if (bdchangelog.fixes != null) {
        changeLog += '' +
            '<h1 class="changelog-fixed">' +
            '   <span>Fixed</span>' +
            '</h1>' +
            '<ul>';

        for (var fix in bdchangelog.fixes) {
            fix = bdchangelog.fixes[fix];

            changeLog += '' +
                '<li>' +
                '   <strong>' + fix.title + '</strong>' +
                '   <div>' + fix.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if (bdchangelog.upcoming != null) {
        changeLog += '' +
            '<h1 class="changelog-in-progress">' +
            '   <span>Coming Soon</span>' +
            '</h1>' +
            '<ul>';

        for (var upc in bdchangelog.upcoming) {
            upc = bdchangelog.upcoming[upc];

            changeLog += '' +
                '<li>' +
                '   <strong>' + upc.title + '</strong>' +
                '   <div>' + upc.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    changeLog += '' +
        '               </div><!--scoller-->' +
        '           </div><!--scroller-wrap-->' +
        '           <div class="footer">' +
        '           </div><!--footer-->' +
        '       </div><!--change-log-->' +
        '   </div><!--modal-inner-->' +
        '</div><!--modal-->';

    return changeLog;
};

Core.prototype.alert = function (title, text) {
    $("body").append('' +
        '<div class="bd-alert">' +
        '   <div class="bd-alert-header">' +
        '       <span>' + title + '</span>' +
        '       <div class="bd-alert-closebtn" onclick="$(this).parent().parent().remove();">×</div>' +
        '   </div>' +
        '   <div class="bd-alert-body">' +
        '       <div class="scroller-wrap dark fade">' +
        '           <div class="scroller">' + text + '</div>' +
        '       </div>' +
        '   </div>' +
        '</div>');
};

Core.prototype.getUtils = function() {
    return this.utils;
};