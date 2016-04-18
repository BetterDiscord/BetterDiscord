/* BetterDiscordApp Settings Panel JavaScript
 * Version: 2.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:54
 * Last Update: 27/11/2015 - 00:50
 * https://github.com/Jiiks/BetterDiscordApp
 */

var settingsButton = null;
var panel = null;

function SettingsPanel() {
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.9.0/codemirror.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.9.0/mode/css/css.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.4.2/Sortable.min.js");
}

SettingsPanel.prototype.init = function () {
    var self = this;
    self.construct();
    var body = $("body");

    if (settingsCookie["bda-es-0"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    if (settingsCookie["bda-gs-2"]) {
        body.addClass("bd-minimal");
    } else {
        body.removeClass("bd-minimal");
    }
    if (settingsCookie["bda-gs-3"]) {
        body.addClass("bd-minimal-chan");
    } else {
        body.removeClass("bd-minimal-chan");
    }

    if (settingsCookie["bda-gs-4"]) {
        voiceMode.enable();
    }

    if(settingsCookie["bda-gs-5"]) {
        $("#app-mount").addClass("bda-dark");
    }

    if (settingsCookie["bda-es-6"]) {
        //Pretty emote titles
        emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
        $(document).on("mouseover", ".emote", function () {
            var x = $(this).offset();
            var title = $(this).attr("alt");
            $(emoteNamePopup).find(".tipsy-inner").text(title);
            $(emoteNamePopup).css('left', x.left - 25);
            $(emoteNamePopup).css('top', x.top - 32);
            $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));
        });
        $(document).on("mouseleave", ".emote", function () {
            $(".tipsy").remove();
        });
    } else {
        $(document).off('mouseover', '.emote');
    }
};

var customCssInitialized = false;
var lastTab = "";

SettingsPanel.prototype.changeTab = function (tab) {

    var self = this;

    lastTab = tab;

    var controlGroups = $("#bd-control-groups");
    $(".bd-tab").removeClass("selected");
    $(".bd-pane").hide();
    $("#" + tab).addClass("selected");
    $("#" + tab.replace("tab", "pane")).show();

    switch (tab) {
    case "bd-settings-tab":
        break;
    case "bd-customcss-tab":
        if (!customCssInitialized) {
            customCssEditor.init();
            customCssInitialized = true;
        }
        break;
    }
};

SettingsPanel.prototype.updateSetting = function (checkbox) {
    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id");
    cb.prop("checked", enabled);

    if(id == "bda-css-2") {
        $("#app-mount").removeClass("bd-hide-bd");
        customCssEditor.hideBackdrop = enabled;
        if(enabled) {
            $("#app-mount").addClass("bd-hide-bd")
        }
    }

    settingsCookie[id] = enabled;

    if (settingsCookie["bda-es-0"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    if (settingsCookie["bda-gs-2"]) {
        $("body").addClass("bd-minimal");
    } else {
        $("body").removeClass("bd-minimal");
    }
    if (settingsCookie["bda-gs-3"]) {
        $("body").addClass("bd-minimal-chan");
    } else {
        $("body").removeClass("bd-minimal-chan");
    }
    if (settingsCookie["bda-gs-1"]) {
        $("#bd-pub-li").show();
    } else {
        $("#bd-pub-li").hide();
    }
    if (settingsCookie["bda-gs-4"]) {
        voiceMode.enable();
    } else {
        voiceMode.disable();
    }
    $("#app-mount").removeClass("bda-dark");
    if(settingsCookie["bda-gs-5"]) {
        $("#app-mount").addClass("bda-dark");
    }
    if (settingsCookie["bda-es-6"]) {
        //Pretty emote titles
        emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
        $(document).on("mouseover", ".emote", function () {
            var x = $(this).offset();
            var title = $(this).attr("alt");
            $(emoteNamePopup).find(".tipsy-inner").text(title);
            $(emoteNamePopup).css('left', x.left - 25);
            $(emoteNamePopup).css('top', x.top - 32);
            $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));
        });
        $(document).on("mouseleave", ".emote", function () {
            $(".tipsy").remove();
        });
    } else {
        $(document).off('mouseover', '.emote');
    } 

    mainCore.saveSettings();
};

SettingsPanel.prototype.construct = function () {
    var self = this;

    panel = $("<div/>", {
        id: "bd-pane",
        class: "settings-inner",
        css: {
            "display": "none"
        }
    });

    var settingsInner = '' +
        '<div class="scroller-wrap">' +
        '   <div class="scroller settings-wrapper settings-panel">' +
        '       <div class="tab-bar TOP">' +
        '           <div class="tab-bar-item bd-tab" id="bd-settings-tab" onclick="settingsPanel.changeTab(\'bd-settings-tab\');">Core</div>' +
        '           <div class="tab-bar-item bd-tab" id="bd-emotes-tab" onclick="settingsPanel.changeTab(\'bd-emotes-tab\');">Emotes</div>' +
        '           <div class="tab-bar-item bd-tab" id="bd-customcss-tab" onclick="settingsPanel.changeTab(\'bd-customcss-tab\');">Custom CSS</div>' +
        '           <div class="tab-bar-item bd-tab" id="bd-plugins-tab" onclick="settingsPanel.changeTab(\'bd-plugins-tab\');">Plugins</div>' +
        '           <div class="tab-bar-item bd-tab" id="bd-themes-tab" onclick="settingsPanel.changeTab(\'bd-themes-tab\');">Themes</div>' +
        '       </div>' +
        '       <div class="bd-settings">' +
        '               <div class="bd-pane control-group" id="bd-settings-pane" style="display:none;">' +
        '                   <ul class="checkbox-group">';

    for (var setting in settings) {

        var sett = settings[setting];
        var id = sett["id"];
        if(sett["cat"] != "core") continue;

        if (sett["implemented"] && !sett["hidden"]) {

            settingsInner += '' +
                '<li>' +
                '<div class="checkbox" onclick="settingsPanel.updateSetting(this);" >' +
                '<div class="checkbox-inner">' +
                '<input type="checkbox" id="' + id + '" ' + (settingsCookie[id] ? "checked" : "") + '>' +
                '<span></span>' +
                '</div>' +
                '<span>' + setting + " - " + sett["info"] +
                '</span>' +
                '</div>' +
                '</li>';
        }
    }

    settingsInner += '  </ul>' +
        '           </div>';


    settingsInner += '<div class="bd-pane control-group" id="bd-emotes-pane" style="display:none;">' +
        '                   <ul class="checkbox-group">';

    for (var setting in settings) {

        var sett = settings[setting];
        var id = sett["id"];
        if(sett["cat"] != "emote") continue;

        if (sett["implemented"] && !sett["hidden"]) {

            settingsInner += '' +
                '<li>' +
                '<div class="checkbox" onclick="settingsPanel.updateSetting(this);" >' +
                '<div class="checkbox-inner">' +
                '<input type="checkbox" id="' + id + '" ' + (settingsCookie[id] ? "checked" : "") + '>' +
                '<span></span>' +
                '</div>' +
                '<span>' + setting + " - " + sett["info"] +
                '</span>' +
                '</div>' +
                '</li>';
        }
    }

    settingsInner += '  </ul>' +
        '           </div>';


    var ccss = atob(localStorage.getItem("bdcustomcss"));
    customCssEditor.applyCustomCss(ccss, true, false);

    settingsInner += '' +
        '               <div class="bd-pane control-group" id="bd-customcss-pane" style="display:none;">' +
        '                   <div id="editor-detached" style="display:none;">' +
        '                       <h3>Editor Detached</h3>' +
        '                       <button class="btn btn-primary" onclick="customCssEditor.attach(); return false;">Attach</button>' +
        '                   </div>' +
        '                   <div id="bd-customcss-innerpane"><textarea id="bd-custom-css-ta">' + ccss + '</textarea></div>' +
        '               </div>' +
        '' +
        '               <div class="bd-pane control-group" id="bd-plugins-pane" style="display:none;">' +
        '                   <table class="bd-g-table">' +
        '                       <thead><tr><th>Name</th><th>Description</th><th>Author</th><th>Version</th><th></th><th></th></tr></thead><tbody>';

    $.each(bdplugins, function () {
        var plugin = this["plugin"];
        settingsInner += '' +
            '<tr>' +
            '   <td>' + plugin.getName() + '</td>' +
            '   <td width="99%"><textarea>' + plugin.getDescription() + '</textarea></td>' +
            '   <td>' + plugin.getAuthor() + '</td>' +
            '   <td>' + plugin.getVersion() + '</td>' +
            '   <td><button class="bd-psb" onclick="pluginModule.showSettings(\'' + plugin.getName() + '\'); return false;"></button></td>' +
            '   <td>' +
            '       <div class="checkbox" onclick="pluginModule.handlePlugin(this);">' +
            '       <div class="checkbox-inner">' +
            '               <input id="' + plugin.getName() + '" type="checkbox" ' + (pluginCookie[plugin.getName()] ? "checked" : "") + '>' +
            '               <span></span>' +
            '           </div>' +
            '       </div>' +
            '   </td>' +
            '</tr>';
    });

    settingsInner += '</tbody></table>' +
        '               </div>' +
        '               <div class="bd-pane control-group" id="bd-themes-pane" style="display:none;">';


    if (typeof (themesupport2) === "undefined") {
        settingsInner += '' +
            '                   Your version does not support themes. Download the latest version.';
    } else {
        settingsInner += '' +
            '                   <table class="bd-g-table">' +
            '                       <thead><tr><th>Name</th><th>Description</th><th>Author</th><th>Version</th><th></th></tr></thead><tbody>';
        $.each(bdthemes, function () {
            settingsInner += '' +
                '<tr>' +
                '   <td>' + this["name"].replace(/_/g, " ") + '</td>' +
                '   <td width="99%"><textarea>' + this["description"] + '</textarea></td>' +
                '   <td>' + this["author"] + '</td>' +
                '   <td>' + this["version"] + '</td>' +
                '   <td>' +
                '       <div class="checkbox" onclick="themeModule.handleTheme(this);">' +
                '           <div class="checkbox-inner">' +
                '               <input id="ti' + this["name"] + '" type="checkbox" ' + (themeCookie[this["name"]] ? "checked" : "") + '>' +
                '               <span></span>' +
                '           </div>' +
                '       </div>' +
                '   </td>' +
                '</tr>';
        });
        settingsInner += '</tbody></table>';
    }


    settingsInner += '' +
        '               </div>' +
        '' +
        '       </div>' +
        '   </div>' +
        '   <div style="background:#2E3136; color:#ADADAD; height:30px; position:absolute; bottom:0; left:0; right:0;">' +
        '       <span style="line-height:30px;margin-left:10px;">BetterDiscord v' + version + '(JSv' + jsVersion + ') by Jiiks</span>' +
        '       <span style="float:right;line-height:30px;margin-right:10px;"><a href="http://betterdiscord.net" target="_blank">BetterDiscord.net</a></span>' +
        '   </div>' +
        '</div>';

    function showSettings() {
        $(".tab-bar-item").removeClass("selected");
        settingsButton.addClass("selected");
        $(".form .settings-right .settings-inner").first().hide();
        panel.show();
        if (lastTab == "") {
            self.changeTab("bd-settings-tab");
        } else {
            self.changeTab(lastTab);
        }
    }

    settingsButton = $("<div/>", {
        class: "tab-bar-item",
        text: "BetterDiscord",
        id: "bd-settings-new",
        click: showSettings
    });

    panel.html(settingsInner);

    function defer() {
        if ($(".btn.btn-settings").length < 1) {
            setTimeout(defer, 100);
        } else {
            $(".btn.btn-settings").first().on("click", function () {

                function innerDefer() {
                    if ($(".modal-inner").first().is(":visible")) {

                        panel.hide();
                        var tabBar = $(".tab-bar.SIDE").first();

                        $(".tab-bar.SIDE .tab-bar-item").click(function () {
                            $(".form .settings-right .settings-inner").first().show();
                            $("#bd-settings-new").removeClass("selected");
                            panel.hide();
                        });

                        tabBar.append(settingsButton);
                        $(".form .settings-right .settings-inner").last().after(panel);
                        $("#bd-settings-new").removeClass("selected");
                    } else {
                        setTimeout(innerDefer, 100);
                    }
                }
                innerDefer();
            });
        }
    }
    defer();
};