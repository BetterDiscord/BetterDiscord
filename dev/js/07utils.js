/* BetterDiscordApp Utilities JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:54
 * https://github.com/Jiiks/BetterDiscordApp
 */

var _hash;

function Utils() {

}

Utils.prototype.getTextArea = function () {
    return $(".channel-textarea-inner textarea");
};

Utils.prototype.jqDefer = function (fnc) {
    if (window.jQuery) {
        fnc();
    } else {
        setTimeout(function () {
            this.jqDefer(fnc);
        }, 100);
    }
};

Utils.prototype.getHash = function () {
    $.getJSON("https://api.github.com/repos/Jiiks/BetterDiscordApp/commits/master", function (data) {
        _hash = data.sha;
        emoteModule.getBlacklist();
    });
};

Utils.prototype.loadHtml = function (html, callback) {
    var container = $("<div/>", {
        class: "bd-container"
    }).appendTo("body");

    //TODO Inject these in next core update
    html = '//cdn.rawgit.com/Jiiks/BetterDiscordApp/' + _hash + '/html/' + html + '.html';

    container.load(html, callback());
};

Utils.prototype.injectJs = function (uri) {
    $("<script/>", {
        type: "text/javascript",
        src: uri
    }).appendTo($("body"));
};

Utils.prototype.injectCss = function (uri) {
    $("<link/>", {
        type: "text/css",
        rel: "stylesheet",
        href: uri
    }).appendTo($("head"));
};

Utils.prototype.log = function (message) {
    console.log('%c[%cBetterDiscord%c] %c'+message+'', 'color: red;', 'color: #303030; font-weight:700;', 'color:red;', '');
};

Utils.prototype.err = function (message) {
    console.log('%c[%cBetterDiscord%c] %c'+message+'', 'color: red;', 'color: red; font-weight:700;', 'color:red;', '');
};

Utils.prototype.importSettings = function() {
    mainCore.alert("Import Settings", '<div class="form" style="width:100%;"><div class="control-group"><textarea id="bda-import-textarea" style="min-height:150px;"></textarea></div><button id="bda-import-settings" class="btn btn-primary">Import</button></div>');
    $("#bda-import-settings").off("click").on("click", function() {
        var obj;
        try {
            obj = JSON.parse($("#bda-import-textarea").val());
        }catch(err) {
            mainCore.alert("Invalid Data", err);
            return false;
        }
        try {
            for(key in obj.settings) {
                var val = obj.settings[key];
                if(settingsCookie.hasOwnProperty(key)) {
                    settingsCookie[key] = val;
                    var cb = $("#" + key);
                    cb.prop("checked", val);
                    settingsPanel.updateSettings();
                }
            }
            localStorage["bdcustomcss"] = obj.customCss;
            var ccss = atob(localStorage.getItem("bdcustomcss"));
            if (!customCssInitialized) {
                customCssEditor.init();
                customCssInitialized = true;
            }
            customCssEditor.applyCustomCss(ccss, settingsCookie["bda-css-0"], false); 
            customCssEditor.editor.setValue(ccss);
        }catch(err) {
            mainCore.alert("Invalid Data", err);
            return false;
        }

        try {
            $.each(obj.plugins, function(plugin) {
                var enabled = obj.plugins[plugin];
                if(bdplugins.hasOwnProperty(plugin)) {
                    pluginCookie[plugin] = enabled;
                    var cb = $("#"+plugin.replace(" ", "__"));
                    if(cb.is(":checked") && !enabled) {
                        bdplugins[plugin]["plugin"].stop();
                        cb.prop("checked", false);
                    }
                    if(!cb.is(":checked") && enabled) {
                        bdplugins[plugin]["plugin"].start();
                        cb.prop("checked", true);
                    }
                }
            });
            pluginModule.savePluginData();
        }catch(err) {
            mainCore.alert("Failed to load plugin data", err);
            return false;
        }

        try {
            themeCookie = obj.themes;
            $.each(themeCookie, function(theme) {
                var enabled = themeCookie[theme];
                var id = "#ti" + theme;
                if(bdthemes.hasOwnProperty(theme)) {
                    if($(id).is(":checked") && !enabled) {
                        $(id).prop("checked", false);
                        $("#"+theme).remove();
                    }
                    if(!$(id).is(":checked") && enabled) {
                        $(id).prop("checked", true);
                        $("head").append('<style id="' + theme + '">' + unescape(bdthemes[theme]["css"]) + '</style>');
                    }
                }
            });
            themeModule.saveThemeData();
        }catch(err) {
            mainCore.alert("Failed to load theme data", err);
            return false;
        }

        return false;
    });
};

Utils.prototype.exportSettings = function() {
    var obj =  {
        settings: settingsCookie,
        customCss: localStorage["bdcustomcss"],
        plugins: pluginCookie,
        themes: themeCookie,
        favEmotes: window.localStorage["bdfavemotes"]
    };
    mainCore.alert("Export Settings", '<div class="form" style="width:100%;"><div class="control-group"><textarea style="min-height:150px;">'+JSON.stringify(obj)+'</textarea></div></div>');
};

Utils.prototype.addBackdrop = function(target) {
    var backDrop = $("<div/>", {
        class: "bda-backdrop",
        "data-bdbackdrop": target,
        mouseup: function() {
            $('[data-bdalert="'+target+'"]').remove();
            $(this).remove();
        }
    });
    $("#app-mount").append(backDrop)
};

Utils.prototype.removeBackdrop = function(target) {
    $('[data-bdbackdrop="'+target+'"]').remove();
};