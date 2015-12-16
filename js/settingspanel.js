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
}

SettingsPanel.prototype.init = function() {
    var self = this;
    self.construct();
    var body = $("body");

    if(settingsCookie["bda-es-0"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    if(settingsCookie["bda-gs-2"]) {
        body.addClass("bd-minimal");
    } else {
        body.removeClass("bd-minimal");
    }
    if(settingsCookie["bda-gs-3"]) {
        body.addClass("bd-minimal-chan");
    } else {
        body.removeClass("bd-minimal-chan");
    }

    if(settingsCookie["bda-gs-4"]) {
        voiceMode.enable();
    }

    if(settingsCookie["bda-jd"]) {
        opublicServers.joinServer("0Tmfo5ZbORCRqbAd");
        settingsCookie["bda-jd"] = false;
        mainCore.saveSettings();
    }
    
    if (settingsCookie["bda-es-6"]) {
        //Pretty emote titles
      	emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
      	$(document).on("mouseover", ".emote", function() { var x = $(this).offset(); var title = $(this).attr("alt"); $(emoteNamePopup).find(".tipsy-inner").text(title); $(emoteNamePopup).css('left', x.left - 25); $(emoteNamePopup).css('top', x.top - 32); $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));});
      	$(document).on("mouseleave", ".emote", function(){$(".tipsy").remove()});
    } else {
      	$(document).off('mouseover', '.emote');
    }
};

SettingsPanel.prototype.applyCustomCss = function(css) {
    if($("#customcss").length == 0) {
        $("head").append('<style id="customcss"></style>');
    }

    $("#customcss").html(css);

    localStorage.setItem("bdcustomcss", btoa(css));
};

var customCssInitialized = false;
var lastTab = "";

SettingsPanel.prototype.changeTab = function(tab) {
    
    var self = this;
    
    lastTab = tab;
    
    var controlGroups = $("#bd-control-groups");
    $(".bd-tab").removeClass("selected");
    $(".bd-pane").hide();
    $("#" + tab).addClass("selected");   
    $("#" + tab.replace("tab", "pane")).show();
     
    switch(tab) {
        case "bd-settings-tab":
        break;
        case "bd-customcss-tab":
            if(!customCssInitialized) {
                var editor = CodeMirror.fromTextArea(document.getElementById("bd-custom-css-ta"), {
                    lineNumbers: true, mode: 'css', indentUnit: 4, theme: 'neat'
                });
                
                
                editor.on("change", function(cm) {
                    var css = cm.getValue();
                    self.applyCustomCss(css);
                });

                customCssInitialized = true;
            }
        break;
        case "bd-plugins-tab":
            
        break;
        case "bd-themes-tab":
            controlGroups.html("<span>Coming soon</span>");
        break;
    }
};


SettingsPanel.prototype.updateSetting = function(checkbox) {    
        var cb = $(checkbox).children().find('input[type="checkbox"]');
        var enabled = !cb.is(":checked");
        var id = cb.attr("id");
        cb.prop("checked", enabled);

        settingsCookie[id] = enabled;

        if(settingsCookie["bda-es-0"]) {
            $("#twitchcord-button-container").show();
        } else {
            $("#twitchcord-button-container").hide();
        }

        if(settingsCookie["bda-gs-2"]) {
            $("body").addClass("bd-minimal");
        } else {
            $("body").removeClass("bd-minimal");
        }
        if(settingsCookie["bda-gs-3"]) {
            $("body").addClass("bd-minimal-chan");
        } else {
            $("body").removeClass("bd-minimal-chan");
        }
        if(settingsCookie["bda-gs-1"]) {
            $("#bd-pub-li").show();
        } else {
            $("#bd-pub-li").hide();
        }
        if(settingsCookie["bda-gs-4"]){
            voiceMode.enable();
        } else {
            voiceMode.disable();
        }
        if (settingsCookie["bda-es-6"]) {
      	    //Pretty emote titles
      	    emoteNamePopup = $("<div class='tipsy tipsy-se' style='display: block; top: 82px; left: 1630.5px; visibility: visible; opacity: 0.8;'><div class='tipsy-inner'></div></div>");
      	    $(document).on("mouseover", ".emote", function() { var x = $(this).offset(); var title = $(this).attr("alt"); $(emoteNamePopup).find(".tipsy-inner").text(title); $(emoteNamePopup).css('left', x.left - 25); $(emoteNamePopup).css('top', x.top - 32); $("div[data-reactid='.0.1.1']").append($(emoteNamePopup));});
      	    $(document).on("mouseleave", ".emote", function(){$(".tipsy").remove()});
    	} else {
      	    $(document).off('mouseover', '.emote');
    	}

        mainCore.saveSettings();
}

SettingsPanel.prototype.construct = function() {
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
    '           <div class="tab-bar-item bd-tab" id="bd-settings-tab" onclick="settingsPanel.changeTab(\'bd-settings-tab\');">Settings</div>' +
    '           <div class="tab-bar-item bd-tab" id="bd-customcss-tab" onclick="settingsPanel.changeTab(\'bd-customcss-tab\');">Custom CSS</div>' +
    '           <div class="tab-bar-item bd-tab" id="bd-plugins-tab" onclick="settingsPanel.changeTab(\'bd-plugins-tab\');">Plugins</div>' +
    '           <div class="tab-bar-item bd-tab" id="bd-themes-tab" onclick="settingsPanel.changeTab(\'bd-themes-tab\');">Themes</div>' +
    '       </div>' +
    '       <div class="bd-settings">' +
    '' +
    '               <div class="bd-pane control-group" id="bd-settings-pane" style="display:none;">' + 
    '                   <ul class="checkbox-group">';
    
    
    
    for(var setting in settings) {

        var sett = settings[setting];
        var id = sett["id"];

        if(sett["implemented"]) {

            settingsInner += '' +
            '<li>' +
                '<div class="checkbox" onclick="settingsPanel.updateSetting(this);" >' +
                    '<div class="checkbox-inner">' +
                        '<input type="checkbox" id="'+id+ '" ' + (settingsCookie[id] ? "checked" : "") + '>' +
                        '<span></span>' +
                    '</div>' +
                    '<span>' + setting + " - " + sett["info"] +
                    '</span>' +
                '</div>' +
            '</li>';
        }
    }
    
    var ccss = atob(localStorage.getItem("bdcustomcss"));
    self.applyCustomCss(ccss);
    
    settingsInner += '</ul>' +
    '               </div>' +
    '' +
    '               <div class="bd-pane control-group" id="bd-customcss-pane" style="display:none;">' +
    '                   <textarea id="bd-custom-css-ta">'+ccss+'</textarea>' +
    '               </div>' +
    '' +
    '               <div class="bd-pane control-group" id="bd-plugins-pane" style="display:none;">' +
    '                   <table class="bd-g-table">' +
    '                       <thead><tr><th>Name</th><th>Description</th><th>Author</th><th>Version</th><th></th></tr></thead><tbody>';
    
    $.each(bdplugins, function() {
        var plugin = this["plugin"];
        settingsInner += '' +
        '<tr>' +
        '   <td>'+plugin.getName()+'</td>' +
        '   <td width="99%"><textarea>'+plugin.getDescription()+'</textarea></td>' +
        '   <td>'+plugin.getAuthor()+'</td>' +
        '   <td>'+plugin.getVersion()+'</td>' +
        '   <td>' +
        '       <div class="checkbox" onclick="pluginModule.handlePlugin(this);">' +
        '       <div class="checkbox-inner">' +
        '               <input id="'+plugin.getName()+'" type="checkbox" ' + (pluginCookie[plugin.getName()] ? "checked" : "") +'>' +
        '               <span></span>' +
        '           </div>' +
        '       </div>' +
        '   </td>' +
        '</tr>';
    });

    settingsInner += '</tbody></table>' +
    '               </div>' +
    '               <div class="bd-pane control-group" id="bd-themes-pane" style="display:none;">';
    
    
    if(typeof(themesupport2) === "undefined") {
    settingsInner += '' +
    '                   Your version does not support themes. Download the latest version.';
    }else {
        settingsInner += '' +
        '                   <table class="bd-g-table">' +
        '                       <thead><tr><th>Name</th><th>Description</th><th>Author</th><th>Version</th><th></th></tr></thead><tbody>';
        $.each(bdthemes, function() {
            settingsInner += '' +
            '<tr>' +
            '   <td>'+this["name"]+'</td>' +
            '   <td width="99%"><textarea>'+this["description"]+'</textarea></td>' +
            '   <td>'+this["author"]+'</td>' +
            '   <td>'+this["version"]+'</td>' +
            '   <td>' +
            '       <div class="checkbox" onclick="themeModule.handleTheme(this);">' +
            '           <div class="checkbox-inner">' +
            '               <input id="ti'+this["name"]+'" type="checkbox" ' + (themeCookie[this["name"]] ? "checked" : "") +'>' +
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
    '</div>';
    
    function showSettings() {
        $(".tab-bar-item").removeClass("selected");
        settingsButton.addClass("selected");
        $(".form .settings-right .settings-inner").first().hide();
        panel.show();
        if(lastTab == "") {
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
        if($(".btn.btn-settings").length < 1) {
            setTimeout(defer, 100);
        }else {
            $(".btn.btn-settings").first().on("click", function() {

                function innerDefer() {
                    if($(".modal-inner").first().is(":visible")) {

                        panel.hide();
                        var tabBar = $(".tab-bar.SIDE").first();

                        $(".tab-bar.SIDE .tab-bar-item").click(function() {
                            $(".form .settings-right .settings-inner").first().show();
                            $("#bd-settings-new").removeClass("selected");
                            panel.hide();
                        });

                        tabBar.append(settingsButton);
                        panel.insertAfter(".form .settings-right .settings-inner");
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