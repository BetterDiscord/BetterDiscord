/* BetterDiscordApp VoiceMode JavaScript
 * Version: 1.0
 * Author: Jiiks | http://jiiks.net
 * Date: 25/10/2015 - 19:10
 * https://github.com/Jiiks/BetterDiscordApp
 */

function VoiceMode() {

}

VoiceMode.prototype.enable = function() {
    $($(".scroller.guild-channels ul")[0]).css("display", "none");
    $($(".scroller.guild-channels header")[0]).css("display", "none");
    $($(".flex-vertical.flex-spacer")[0]).css("overflow", "hidden");
    $($(".chat.flex-vertical.flex-spacer")[0]).css("visibility", "hidden");
    $($(".chat.flex-vertical.flex-spacer")[0]).css("min-width", "0px");
    $($(".flex-vertical.channels-wrap")[0]).css("width", "100%");
    $($(".guild-header .btn.btn-hamburger")[0]).css("visibility", "hidden");

}

VoiceMode.prototype.disable = function() {
    $($(".scroller.guild-channels ul")[0]).css("display", "");
    $($(".scroller.guild-channels header")[0]).css("display", "");
    $($(".flex-vertical.flex-spacer")[0]).css("overflow", "");
    $($(".chat.flex-vertical.flex-spacer")[0]).css("visibility", "");
    $($(".chat.flex-vertical.flex-spacer")[0]).css("min-width", "");
    $($(".flex-vertical.channels-wrap")[0]).css("width", "");
    $($(".guild-header .btn.btn-hamburger")[0]).css("visibility", "");
}