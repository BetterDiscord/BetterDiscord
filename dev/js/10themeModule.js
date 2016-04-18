/* BetterDiscordApp ThemeModule JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 16/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 */

var themeCookie = {};

function ThemeModule() {

}

ThemeModule.prototype.loadThemes = function () {
    this.loadThemeData();

    $.each(bdthemes, function () {
        var name = this["name"];
        var enabled = false;
        if (themeCookie.hasOwnProperty(name)) {
            if (themeCookie[name]) {
                enabled = true;
            }
        } else {
            themeCookie[name] = false;
        }

        if (enabled) {
            $("head").append('<style id="' + name + '">' + unescape(bdthemes[name]["css"]) + '</style>');
        }
    });
};

ThemeModule.prototype.handleTheme = function (checkbox) {

    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id").substring(2);
    cb.prop("checked", enabled);

    if (enabled) {
        $("head").append('<style id="' + id + '">' + unescape(bdthemes[id]["css"]) + '</style>');
        themeCookie[id] = true;
    } else {
        $("#" + id).remove();
        themeCookie[id] = false;
    }

    this.saveThemeData();
};

ThemeModule.prototype.loadThemeData = function () {
    var cookie = $.cookie("bd-themes");
    if (cookie != undefined) {
        themeCookie = JSON.parse($.cookie("bd-themes"));
    }
};

ThemeModule.prototype.saveThemeData = function () {
    $.cookie("bd-themes", JSON.stringify(themeCookie), {
        expires: 365,
        path: '/'
    });
};
