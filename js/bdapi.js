/* BetterDiscordApp API for Plugins
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 11/12/2015
 * Last Update: 11/12/2015
 * https://github.com/Jiiks/BetterDiscordApp
 * 
 * Plugin Template: https://gist.github.com/Jiiks/71edd5af0beafcd08956
 */

function BdApi() {}

//Joins a server
//code = server invite code
BdApi.joinServer = function (code) {
    opublicServers.joinServer(code);
};

//Inject CSS to document head
//id = id of element
//css = custom css
BdApi.injectCSS = function (id, css) {
    $("head").append('<style id="' + id + '"></style>');
    $("#" + id).html(css);
};

//Clear css/remove any element
//id = id of element
BdApi.clearCSS = function (id) {
    $("#" + id).remove();
};

//Get another plugin
//name = name of plugin
BdApi.getPlugin = function (name) {
    if (bdplugins.hasOwnProperty(name)) {
        return bdplugins[name]["plugin"];
    }
    return null;
};

//Get ipc for reason
BdApi.getIpc = function () {
    return betterDiscordIPC;
};

//Get BetterDiscord Core
BdApi.getCore = function () {
    return mainCore;
};

//Attempts to get user id by username
//Name = username
//Since Discord hides users if there's too many, this will often fail
BdApi.getUserIdByName = function (name) {
    var users = $(".member-username");

    for (var i = 0; i < users.length; i++) {
        var user = $(users[i]);
        if (user.text() == name) {
            var avatarUrl = user.closest(".member").find(".avatar-small").css("background-image");
            return avatarUrl.match(/\d+/);
        }
    }
    return null;
};

//Attempts to get username by id
//ID = user id
//Since Discord hides users if there's too many, this will often fail
var gg;
BdApi.getUserNameById = function (id) {
    var users = $(".avatar-small");

    for (var i = 0; i < users.length; i++) {
        var user = $(users[i]);
        var url = user.css("background-image");
        if (id == url.match(/\d+/)) {
            return user.parent().find(".member-username").text();
        }
    }
    return null;
};

//Set current game
//game = game
BdApi.setPlaying = function (game) {
    bdws.send({
        "op": 3,
        "d": {
            "idle_since": null,
            "game": {
                "name": game
            }
        }
    });
};

//Set current status
//idle_since = date
//status = status
BdApi.setStatus = function (idle_since, status) {
    bdws.send({
        "op": 3,
        "d": {
            "idle_since": idle_since,
            "game": {
                "name": status
            }
        }
    });
};