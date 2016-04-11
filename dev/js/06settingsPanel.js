/* BetterDiscordApp Settings Panel JavaScript
 * Version: 2.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:54
 * Last Update: 10/04/2016
 * https://github.com/Jiiks/BetterDiscordApp
 */

function SettingsPanel() {
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.9.0/codemirror.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.9.0/mode/css/css.min.js");
    utils.injectJs("https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.4.2/Sortable.min.js");
}

SettingsPanel.prototype.init = function () {
    var self = this;
    self.constructPanel();
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
        $(document).off("mouseover.etitles").on("mouseover.etitles", ".emote", function () {
            var x = $(this).offset();
            var title = $(this).attr("alt");
            $(emoteNamePopup).find(".tipsy-inner").text(title);
            $(emoteNamePopup).css('left', x.left - 25);
            $(emoteNamePopup).css('top', x.top - 32);
            $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));
        });
        $(document).off("mouseleave.etitles").on("mouseleave.etitles", ".emote", function () {
            $(".tipsy").remove();
        });
    } else {
        $(document).off("mouseover.etitles");
        $(document).off("mouseleave.etitles");
    }
};

SettingsPanel.prototype.changeTab = function(tab) {
    this.lastTab = tab;
    tab = $(tab).prop("id");
    $(".bd-tab").removeClass("selected");
    $(".bd-pane").hide();
    $("#" + tab).addClass("selected");
    $("#" + tab.replace("tab", "pane")).show();

    switch(tab) {
    case "bd-customcss-tab":
        if(!this.customCssInitialized) {
            customCssEditor.init();
            this.customCssInitialized = true;
        }
        break; 
    }
};

SettingsPanel.prototype.updateSetting = function(checkbox) {
    console.log("Working?");
};

SettingsPanel.prototype.constructPanel = function() {
    var self = this;
    self.lastTab = "";

    panel = $("<div/>", {
        id: "bd-pane",
        class: "settings-inner",
        css: {
            "display": "none"
        }
    });

    var panelHtml = '\
    <div class="scroller-wrap">\
        <div class="scroller settings-wrapper settings-panel">\
            <div class="tab-bar TOP">\
                <div class="tab-bar-item bd-tab selected" id="bd-settings-tab" onclick="settingsPanel.changeTab(this);">Core</div>\
                <div class="tab-bar-item bd-tab" id="bd-emotes-tab" onclick="settingsPanel.changeTab(this);">Emotes</div>\
                <div class="tab-bar-item bd-tab" id="bd-customcss-tab" onclick="settingsPanel.changeTab(this);">Custom CSS</div>\
                <div class="tab-bar-item bd-tab" id="bd-plugins-tab" onclick="settingsPanel.changeTab(this);">Plugins</div>\
                <div class="tab-bar-item bd-tab" id="bd-themes-tab" onclick="settingsPanel.changeTab(this);">Themes</div>\
            </div>\
            <div class="bd-settings">\
                <div class="bd-pane control-group" id="bd-settings-pane" style="">\
                    <ul class="checkbox-group">\
    ';

    //Core settings
    for(var setting in bdConfig.options) {
        var sett = bdConfig.options[setting];
        var id = sett["id"];
        if(sett["cat"] != "core" || !sett["implemented"] || sett["hidden"]) continue;
        
        panelHtml += '\
                        <li>\
                            <div class="checkbox" onclick="settingsPanel.updateSetting(this);">\
                                <div class="checkbox-inner">\
                                    <input type="checkbox" id="'+id+'" '+(settingsCookie[id] ? "checked" : "")+'>\
                                    <span></span>\
                                </div>\
                                <span>\
                                '+setting+' - '+sett["info"]+'\
                                </span>\
                            </div>\
                        </li>\
        ';
    }

    panelHtml += '\
                    </ul>\
                </div>\
                <div class="bd-pane control-group" id="bd-emotes-pane" style="display:none;">\
                    <ul class="checkbox-group">\
    ';

    //Emote settings
    for(var setting in bdConfig.options) {
        var sett = bdConfig.options[setting];
        var id = sett["id"];
        if(sett["cat"] != "emote" || !sett["implemented"] || sett["hidden"]) continue;
        
        panelHtml += '\
                        <li>\
                            '+
                            utils.getDiscordCheckbox({
                                onClick: "settingsPanel.updateSetting(this)",
                                id: id,
                                checked: settingsCookie[id],
                                text: setting + " - " + sett["info"]
                            })
                            +'\
                        </li>\
        ';
    }

    var ccss = atob(localStorage.getItem("bdcustomcss"));
    customCssEditor.applyCustomCss(ccss, true, false);

    panelHtml += '\
                    </ul>\
                </div>\
                <div class="bd-pane control-group" id="bd-customcss-pane" style="display:none;">\
                    <div id="editor-detached" style="display:none;">\
                        <h3>Editor Detached</h3>\
                        <button class="btn btn-primary" onclick="customCssEditor.attach(); return false;">Attach</button>\
                    </div>\
                    <div id="bd-customcss-innerpane">\
                        <textarea id="bd-custom-css-ta">'+ccss+'</textarea>\
                    </div>\
                </div>\
                <div class="bd-pane control-group" id="bd-plugins-pane" style="display:none;">\
                    <ul class="bda-slist">\
    ';


    //Plugins
    $.each(bdplugins, function() {
        var plugin = this["plugin"];
    panelHtml += '\
                        <li>\
                            <div class="bda-left">\
                                <div class="bda-name">\
                                    '+plugin.getName() + ' v' + plugin.getVersion() + ' by ' + plugin.getAuthor() +'\
                                </div>\
                                <div class="bda-description">\
                                    '+plugin.getDescription()+'\
                                </div>\
                            </div>\
                            <div class="bda-right">\
                                <div class="checkbox">\
                                    <div class="checkbox-inner">\
                                        <input type="checkbox">\
                                        <span></span>\
                                    </div>\
                                </div>\
                                <button class="btn btn-primary">Settings</button>\
                            </div>\
                        </li>\
    ';
    });


    panelHtml += '\
                    </ul>\
                </div>\
                <div class="bd-pane control-group" id="bd-themes-pane" style="display:none;">\
                </div>\
            </div>\
        </div>\
        <div style="background:#2E3136; color:#ADADAD; height:30px; position:absolute; bottom:0; left:0; right:0;"> <span style="line-height:30px;margin-left:10px;">BetterDiscord v'+BdApi.getCore().version+'(JSv'+BdApi.getCore().jsVersion+') by Jiiks</span> <span style="float:right;line-height:30px;margin-right:10px;"><a href="http://betterdiscord.net" target="_blank">BetterDiscord.net</a></span> </div>\
    </div>\
    ';

    panel.html(panelHtml);

    function showSettings() {
        $(".tab-bar-item").removeClass("selected");
        settingsButton.addClass("selected");
        $(".form .settings-right .settings-inner").first().hide();
        panel.show();
        if (self.lastTab == "") {
            self.changeTab({id:"bd-settings-tab"});
        } else {
            self.changeTab(self.lastTab);
        }
    }

    settingsButton = $("<div/>", {
        class: "tab-bar-item",
        text: "BetterDiscord",
        id: "bd-settings-new",
        click: showSettings
    });


    (function defer() {
        if($(".btn.btn-settings").length < 1) {
            setTimeout(defer, 100);
            return;
        }

        $(".btn.btn-settings").first().off("click.bda").on("click.bda", function() {
            (function defer() {
                if(!$(".modal-inner").first().is(":visible")) {
                    setTimeout(defer, 100);
                    return;
                }

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

            })();
        });
    })();
};