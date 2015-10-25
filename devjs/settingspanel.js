/* BetterDiscordApp Settings Panel JavaScript
 * Version: 1.3
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:54
 * Last Update: 30/08/2015 - 12:16
 * https://github.com/Jiiks/BetterDiscordApp
 */

var links = { "Jiiks.net": "http://jiiks.net", "Twitter": "http://twitter.com/jiiksi", "Github": "https://github.com/jiiks" };

function SettingsPanel() {

}

SettingsPanel.prototype.getPanel = function() {
    return this.tcSettingsPanel;
}

SettingsPanel.prototype.init = function() {

    var self = this;
    this.tcSettingsPanel = $("<div/>", { id: "tc-settings-panel", style: "display:none" });
    this.getPanel().append($("<div/>", { id: "tc-settings-panel-header" }).append($("<h2/>", { text: "BetterDiscord - Settings" })).append($("<span/>", { id: "tc-settings-close", text: "X", style:"cursor:pointer;" })));

    var settingsList = $("<ul/>");
    this.getPanel().append($("<div/>", { id: "tc-settings-panel-body" }).append(settingsList));

    $.each(settings, function(key, value) {
        var son = "tc-switch-on";
        var sof = "tc-switch-off";

        if(settingsCookie[value.id]) {
            son = "tc-switch-on active";
        }else {
            sof = "tc-switch-off active";
        }

        settingsList.append($("<li/>").append($("<h2/>", { text: key})).append($("<span/>", { html: " - <span>" + value.info  + "</span>" + (value.implemented == false ? '<span style="color:red">  Coming Soon</span>' : "") })).append($("<div/>", { class: value.implemented ? "tc-switch" : "tc-switch disabled", id: value.id }).append($("<span/>", { class: sof, text: "OFF" })).append($("<span/>", { class: son, text: "ON" }))));
    })

    var settingsFooter = $("<div/>", { id: "tc-settings-panel-footer" });
    settingsFooter.append($("<span/>", { id: "tc-about", text: "BDA v" + version + "(js "+jsVersion+") by Jiiks | Settings are automatically saved." } ));
    var tcLinks = $("<span/>", { id: "tc-links" });
    $.each(links, function(key, value) {
        tcLinks.append($("<a/>", { href: value, text: key, target: "_blank" }));
        tcLinks.append($("<span/>", { text: " | " }));
    })
    settingsFooter.append(tcLinks);
    this.getPanel().append(settingsFooter);


    $("body").append(this.getPanel());
    $("#tc-settings-close").on("click", function(e) { self.show(); });
    $(".tc-switch").on("click", function() { self.handler($(this)) });

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
}


SettingsPanel.prototype.show = function() {
    this.getPanel().toggle();
    $("#tc-settings-li").removeClass();
    if(this.getPanel().is(":visible")) {
        $("#tc-settings-li").addClass("active");
    }
}


SettingsPanel.prototype.handler = function(e){
    var sid = e.attr("id");
    var enabled = settingsCookie[sid];
    enabled = !enabled;
    settingsCookie[sid] = enabled;

    var swoff = $("#" + sid + " .tc-switch-off");
    var swon = $("#" + sid + " .tc-switch-on");
    swoff.removeClass("active");
    swon.removeClass("active");

    if(enabled) {
        swon.addClass("active");
    } else {
        swoff.addClass("active");
    }


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

    mainCore.saveSettings();
}