/*Note this is partial changes*/

var _betterDiscord = require('betterdiscord');

function launchMainAppWindow(isVisible) {

_betterDiscord = new _betterDiscord.BetterDiscord(mainWindow);
_betterDiscord.init();

}

 