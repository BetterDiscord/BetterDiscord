/* BetterDiscordApp Core JavaScript
 * Version: 1.53
 * Author: Jiiks | http://jiiks.net
 * Date: 27/08/2015 - 16:36
 * Last Update: 02/04/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */

var BD;

function Core() {
    BD = this;
}

Core.prototype.init = function () {
    var self = this;
    this.version = version;

    if (this.version < bdConfig.versionInfo.supportedVersion) {
        this.alert("Not Supported", "BetterDiscord v" + this.version + "(your version)" + " is not supported by the latest js(" + bdConfig.versionInfo.version + ").<br><br> Please download the latest version from <a href='https://betterdiscord.net' target='_blank'>BetterDiscord.net</a>");
        return;
    }

    this.modules =  {
        emoteModule:    new EmoteModule(),
        publicServers:  new PublicServers(),
        emoteMenu:      new QuickEmoteMenu(),
        cssEditor:      new customCssEditor(),
        settingsPanel:  new SettingsPanel(),
        utils:          new Utils(),
        voiceMode:      new VoiceMode(),
        pluginModule:   new pluginModule(),
        themeModule:    new ThemeModule()
    }

    this.modules.utils.getHash();

    this.modules.emoteModule.init();

    this.initSettings();
    this.initObserver();


    //Incase were too fast
    function gwDefer() {
        self.modules.utils.log(new Date().getTime() + " Defer");

        if ($(".guilds-wrapper .guilds").children().length > 0) {
            self.modules.utils.log(new Date().getTime() + " Defer Loaded");
            var guilds = $(".guilds>li:first-child");

            var showChannelsButton = $("<button/>", {
                class: "btn",
                id: "bd-show-channels",
                text: "R",
                css: {
                    "cursor": "pointer"
                },
                click: function () {
                    self.settingsCookie["bda-gs-3"] = false;
                    $("body").removeClass("bd-minimal-chan");
                    self.saveSettings();
                }
            });

            $(".guilds-wrapper").prepend(showChannelsButton);

            self.modules.pluginModule.loadPlugins();

            if (typeof (themesupport2) !== "undefined") {
                self.modules.themeModule.loadThemes();
            }

            self.modules.settingsPanel.init();

            self.modules.quickEmoteMenu.init(false);
            
            window.addEventListener("beforeunload", function(){
                if(self.settingsCookie["bda-dc-0"]){
                    $('.btn.btn-disconnect').click();
                }
            });
            self.modules.publicServers.init();
            self.modules.emoteModule.autoCapitalize();

            /*Display new features in BetterDiscord*/
            if (self.settingsCookie["version"] < bdConfig.versionInfo.version) {
                var cl = self.constructChangelog();
                $("body").append(cl);
                self.settingsCookie["version"] = bdConfig.versionInfo.version;
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
        this.settingsCookie = bdConfig.defaults;
        this.saveSettings();
    } else {
        this.loadSettings();

        for (var setting in defaultCookie) {
            if (this.settingsCookie[setting] == undefined) {
                this.settingsCookie[setting] = bdConfig.defaults[setting];
                this.saveSettings();
            }
        }
    }
};

Core.prototype.saveSettings = function () {
    $.cookie("better-discord", JSON.stringify(this.settingsCookie), {
        expires: 365,
        path: '/'
    });
};

Core.prototype.loadSettings = function () {
    this.settingsCookie = JSON.parse($.cookie("better-discord"));
};

Core.prototype.initObserver = function () {
    var self = this;
    this.observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if($(mutation.target).find(".emoji-picker").length) {
                var fc = mutation.target.firstChild;
                if(fc.classList.contains("popout")) {
                    self.modules.quickEmoteMenu.obsCallback($(fc));
                }
            }
            if (typeof pluginModule !== "undefined") self.modules.pluginModule.rawObserver(mutation);
            if (mutation.target.getAttribute('class') != null) {
                //console.log(mutation.target)
                if(mutation.target.classList.contains('title-wrap') || mutation.target.classList.contains('chat')){
                   // quickEmoteMenu.obsCallback();
                    self.modules.voiceMode.obsCallback();
                    if (typeof pluginModule !== "undefined") self.modules.pluginModule.channelSwitch();
                }
                if (mutation.target.getAttribute('class').indexOf('scroller messages') != -1) {
                    if (typeof self.modules.pluginModule !== "undefined") self.modules.pluginModule.newMessage();
                }
            }
            self.modules.emoteModule.obsCallback(mutation);
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

    if (bdConfig.changelog.changes != null) {
        changeLog += '' +
            '<h1 class="changelog-added">' +
            '   <span>New Stuff</span>' +
            '</h1>' +
            '<ul>';

        for (var change in bdConfig.changelog.changes) {
            change = bdConfig.changelog.changes[change];

            changeLog += '' +
                '<li>' +
                '   <strong>' + change.title + '</strong>' +
                '   <div>' + change.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if (bdConfig.changelog.fixes != null) {
        changeLog += '' +
            '<h1 class="changelog-fixed">' +
            '   <span>Fixed</span>' +
            '</h1>' +
            '<ul>';

        for (var fix in bdConfig.changelog.fixes) {
            fix = bdConfig.changelog.fixes[fix];

            changeLog += '' +
                '<li>' +
                '   <strong>' + fix.title + '</strong>' +
                '   <div>' + fix.text + '</div>' +
                '</li>';
        }

        changeLog += '</ul>';
    }

    if (bdConfig.changelog.upcoming != null) {
        changeLog += '' +
            '<h1 class="changelog-in-progress">' +
            '   <span>Coming Soon</span>' +
            '</h1>' +
            '<ul>';

        for (var upc in bdConfig.changelog.upcoming) {
            upc = bdConfig.changelog.upcoming[upc];

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