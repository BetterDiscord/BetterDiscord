/* BetterDiscordApp PluginModule JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 16/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 */

var pluginCookie = {};

function PluginModule() {
    
}

PluginModule.prototype.loadPlugins = function() {

    this.loadPluginData();

    $.each(bdplugins, function() {
        var plugin = this["plugin"];
        plugin.load();
        
        var name = plugin.getName();
        var enabled = false;
        
        if(pluginCookie.hasOwnProperty(name)) {
            enabled = pluginCookie[name];
        } else {
            pluginCookie[name] = false;
        }
        
        if(enabled) {
            plugin.start();
        }
    });
};

PluginModule.prototype.handlePlugin = function(checkbox) {
    
    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id");
    cb.prop("checked", enabled);
    
    if(enabled) {
        bdplugins[id]["plugin"].start();
        pluginCookie[id] = true;
    } else {
        bdplugins[id]["plugin"].stop();
        pluginCookie[id] = false;
    }
    
    this.savePluginData();
};

PluginModule.prototype.loadPluginData = function() {
    var cookie = $.cookie("bd-plugins");
    if(cookie != undefined) {
        pluginCookie = JSON.parse($.cookie("bd-plugins")); 
    }
};

PluginModule.prototype.savePluginData = function() {
    $.cookie("bd-plugins", JSON.stringify(pluginCookie), { expires: 365, path: '/' });
};