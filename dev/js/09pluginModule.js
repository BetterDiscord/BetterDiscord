/* BetterDiscordApp PluginModule JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 16/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 */

var pluginCookie = {};

function PluginModule() {

}

PluginModule.prototype.loadPlugins = function () {

    this.loadPluginData();

    $.each(bdplugins, function () {
        var plugin = this["plugin"];
        plugin.load();

        var name = plugin.getName();
        var enabled = false;

        if (pluginCookie.hasOwnProperty(name)) {
            enabled = pluginCookie[name];
        } else {
            pluginCookie[name] = false;
        }

        if (enabled) {
            plugin.start();
        }
    });
};

PluginModule.prototype.handlePlugin = function (checkbox) {

    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id").replace("__", " ");
    cb.prop("checked", enabled);

    if (enabled) {
        bdplugins[id]["plugin"].start();
        pluginCookie[id] = true;
    } else {
        bdplugins[id]["plugin"].stop();
        pluginCookie[id] = false;
    }

    this.savePluginData();
};

PluginModule.prototype.showSettings = function (plugin) {
    if (bdplugins[plugin] != null) {
        if (typeof bdplugins[plugin].plugin.getSettingsPanel === "function") {
            var panel = bdplugins[plugin].plugin.getSettingsPanel();

            $(".modal-inner").off("click.bdpsm").on("click.bdpsm", function (e) {
                if ($("#bd-psm-id").length) {
                    $(".bd-psm").remove();
                } else {
                    $(".bd-psm").attr("id", "bd-psm-id");
                }

            });
            $(".modal").append('<div class="bd-psm"><div class="scroller-wrap" style="height:100%"><div id="bd-psm-s" class="scroller" style="padding:10px;"></div></div></div>');
            $("#bd-psm-s").append(panel);
        }
    }
};

PluginModule.prototype.loadPluginData = function () {
    var cookie = $.cookie("bd-plugins");
    if (cookie != undefined) {
        pluginCookie = JSON.parse($.cookie("bd-plugins"));
    }
};

PluginModule.prototype.savePluginData = function () {
    $.cookie("bd-plugins", JSON.stringify(pluginCookie), {
        expires: 365,
        path: '/'
    });
};

PluginModule.prototype.newMessage = function () {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.onMessage === "function") {
            this.plugin.onMessage();
        }
    });
};

PluginModule.prototype.channelSwitch = function () {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.onSwitch === "function") {
            this.plugin.onSwitch();
        }
    });
};

PluginModule.prototype.socketEvent = function (e, data) {
    $.each(bdplugins, function () {
        if (!pluginCookie[this.plugin.getName()]) return;
        if (typeof this.plugin.socketEvent === "function") {
            this.plugin.socketEvent(data);
        }
    });
};

PluginModule.prototype.rawObserver = function(e) {
    $.each(bdplugins, function() {
        if (!pluginCookie[this.plugin.getName()]) return;
        if(typeof this.plugin.observer === "function") {
            this.plugin.observer(e);
        }
    });
};