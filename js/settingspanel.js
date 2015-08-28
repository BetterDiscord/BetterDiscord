/* BetterDiscordApp Settings Panel JavaScript
 * Version: 1.1
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:54
 * Last Update: 26/08/2015 - 19:38
 * https://github.com/Jiiks/BetterDiscordApp
 */

function SettingsPanel() {

}

SettingsPanel.prototype.getPanel = function() {
    return this.tcSettingsPanel;
}

SettingsPanel.prototype.init = function() {

    var self = this;
    this.tcSettingsPanel = $("<div/>", { id: "tc-settings-panel" });
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
        settingsList.append($("<li/>").append($("<h2/>", { text: key})).append($("<span/>", { text: " - " + value.info })).append($("<div/>", { class: value.implemented ? "tc-switch" : "tc-switch disabled", id: value.id }).append($("<span/>", { class: sof, text: "OFF" })).append($("<span/>", { class: son, text: "ON" }))));
    })

    var settingsFooter = $("<div/>", { id: "tc-settings-panel-footer" });
    settingsFooter.append($("<span/>", { id: "tc-about", text: "BetterDiscord v" + version + " by Jiiks | Settings are automatically saved." } ));
    var tcLinks = $("<span/>", { id: "tc-links" });
    $.each(links, function(key, value) {
        tcLinks.append($("<a/>", { href: value, text: key }));
        tcLinks.append($("<span/>", { text: " | " }));
    })
    settingsFooter.append(tcLinks);
    this.getPanel().append(settingsFooter);


    $("body").append(this.getPanel());
    $("#tc-settings-close").on("click", function(e) { self.show(); });
    $(".tc-switch").on("click", function() { self.handler($(this)) });
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

    $.cookie("better-discord", JSON.stringify(settingsCookie));

    if(settingsCookie["bda-es-qme"]) {
        $("#twitchcord-button-container").show();
    } else {
        $("#twitchcord-button-container").hide();
    }

    autoCapitalize = settingsCookie["bda-es-ace"];

}