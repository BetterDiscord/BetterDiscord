/* BetterDiscordApp EmoteModule JavaScript
 * Version: 1.5
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 15:29
 * Last Update: 14/10/2015 - 09:48
 * https://github.com/Jiiks/BetterDiscordApp
 * Note: Due to conflicts autocapitalize only supports global emotes
 */

/*
 * =Changelog=
 * -v1.5
 * --Twitchemotes.com api
 */

function EmoteModule() {
    this.blacklist = [];
    this.spoilered = [];
    this.emotes = {
        twitchGlobal: emotesTwitch,
        twitchSub: subEmotesTwitch,
        bttvGlobal: emotesBTTV,
        bttvUser: emotesBTTV2,
        ffz: emotesFfz
    };
}

EmoteModule.prototype.init = function () {
    this.config = {
        twitch: {
            url: {
                start: "https://static-cdn.jtvnw.net/emoticons/v1/",
                end: "/1.0"
            }
        },
        ffz: {
            url: {
                start: "https://cdn.frankerfacez.com/emoticon/",
                end: "/1"
            }
        },
        bttv: {
            url: {
                start: "https://cdn.betterttv.net/emote/",
                end: "/1x"
            }
        }
    }
};

EmoteModule.prototype.getBlacklist = function () {
    var self = this;
    $.getJSON("https://cdn.rawgit.com/Jiiks/betterDiscordApp/" + _hash + "/data/emotefilter.json", function (data) {
        self.blacklist = data.blacklist;
    });
};

EmoteModule.prototype.obsCallback = function (mutation) {
    var self = this;

    if (!BD.settingsCookie["bda-es-7"]) return;

    $(".emoji").each(function () {
        var t = $(this);
        if (t.attr("src").indexOf(".png") != -1) {

            var next = t.next();
            var newText = t.attr("alt");
            if(next.size() > 0) {
                if(next.prop("tagName") == "SPAN") {
                    newText += next.text();
                    next.remove();
                }
            }

            if(t.parent().prop("tagName") != "SPAN") {
                t.replaceWith("<span>" + newText + "</span>");
            } else {
                t.replaceWith(newText);
            }
        }
    });

    for (var i = 0; i < mutation.addedNodes.length; ++i) {
        var next = mutation.addedNodes.item(i);
        if (next) {
            var nodes = self.getNodes(next);
            for (var node in nodes) {
                if (nodes.hasOwnProperty(node)) {
                    self.injectEmote(nodes[node]);
                }
            }
        }
    }
};

EmoteModule.prototype.getNodes = function (node) {
    var next;
    var nodes = [];

    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

    while (next = treeWalker.nextNode()) {
        nodes.push(next);
    }

    return nodes;
};

EmoteModule.prototype.injectEmote = function (node) {

    var self = this;

    if (typeof emotesTwitch === 'undefined') return;

    if (!node.parentElement) return;

    var parent = node.parentElement;

    if (parent.tagName != "SPAN") return;
    if (!$(parent.parentElement).hasClass("markup") && !$(parent.parentElement).hasClass("message-content")) {
        return;
    }

    var edited = false;

    if ($(parent.parentElement).hasClass("edited")) {
        parent = parent.parentElement.parentElement.firstChild;
        edited = true;
    }

    function inject() {
        var parentInnerHTML = parent.innerHTML;
        var words = parentInnerHTML.split(/\s+/g);

        if (!words) return;

        words.some(function (word) {
            if (word.slice(0, 4) == "[!s]") {

                parentInnerHTML = parentInnerHTML.replace("[!s]", "");
                var markup = $(parent).parent();
                var reactId = markup.attr("data-reactid");

                if (self.spoilered.indexOf(reactId) > -1) {
                    return;
                }

                markup.addClass("spoiler");
                markup.on("click", function () {
                    $(this).removeClass("spoiler");
                    self.spoilered.push($(this).attr("data-reactid"));
                });

                return;
            }

            if (word.length < 4) {
                return;
            }

            if (word == "ClauZ") {
                parentInnerHTML = parentInnerHTML.replace("ClauZ", '<img src="https://cdn.frankerfacez.com/emoticon/70852/1" style="width:25px; transform:translate(-29px, -14px);"></img>');
                return;
            }

            var useEmoteCss = false;
            var sWord = word;
            var emoteClass = "";
            var allowedClasses = ["emoteflip", "emotespin", "emotepulse", "emotespin2", "emotespin3", "emote1spin", "emote2spin", "emote3spin", "emotetr", "emotebl", "emotebr", "emoteshake", "emoteshake2", "emoteshake3", "emoteflap"];
            if(word.indexOf(":") > -1) {
                var split = word.split(/:(?!.*:)/);
                if (split[0] != "" && split[1] != "") { 
                    userEmoteCss = true;
                    sWord = split[0];
                    if(BD.settingsCookie["bda-es-8"]) {
                        emoteClass = "emote" + split[1];
                        if(allowedClasses.indexOf(emoteClass) < 0) {
                            emoteClass = "";
                        }
                    }
                }
            }
            if ($.inArray(sWord, self.blacklist) != -1) return;

            var len = Math.round(sWord.length / 4);
            var name = sWord.substr(0, len) + "\uFDD9" + sWord.substr(len, len) + "\uFDD9" + sWord.substr(len * 2, len) + "\uFDD9" + sWord.substr(len * 3);
            var cfg = self.config;
            if (self.emotes.twitchGlobal.emotes.hasOwnProperty(sWord)) {
                var url = cfg.twitch.url.start + self.emotes.twitchGlobal.emotes[sWord].image_id + cfg.twitch.url.end;
                parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote '+emoteClass+'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></div>');
                return;
            }

            if (self.emotes.twitchSub.hasOwnProperty(sWord)) {
                var url = cfg.twitch.url.start + self.emotes.twitchSub[sWord] + cfg.twitch.url.end;
                parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote '+emoteClass+'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></div>');
                return;
            }
            
            if (typeof self.emotes.bttvGlobal !== 'undefined' && BD.settingsCookie["bda-es-2"]) {
                if (self.emotes.bttvGlobal.hasOwnProperty(sWord)) {
                    var url = self.emotes.bttvGlobal[sWord];
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote '+emoteClass+'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }

            if (typeof self.emotes.bttvUser !== 'undefined' && BD.settingsCookie["bda-es-2"]) {
                if (self.emotes.bttvUser.hasOwnProperty(sWord)) {
                    var url = cfg.bttv.url.start + self.emotes.bttvUser[sWord] + cfg.bttv.url.end;
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote '+emoteClass+'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }

            if (typeof self.emotes.ffz !== 'undefined' && BD.settingsCookie["bda-es-1"]) {
                if (self.emotes.ffz.hasOwnProperty(sWord)) {
                    var url = cfg.ffz.url.start + self.emotes.ffz[sWord] + cfg.ffz.url.end;
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote '+emoteClass+'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }

        });

        if (parent.parentElement == null) return;

        var oldHeight = parent.parentElement.offsetHeight;
        parent.innerHTML = parentInnerHTML.replace(new RegExp("\uFDD9", "g"), "");
        var newHeight = parent.parentElement.offsetHeight;

        var scrollPane = $(".scroller.messages").first();
        scrollPane.scrollTop(scrollPane.scrollTop() + (newHeight - oldHeight));
        
    }

    if (edited) {
        setTimeout(inject, 250);
    } else {
        inject();
    }
};

EmoteModule.prototype.autoCapitalize = function () {

    var self = this;

    $('body').delegate($(".channel-textarea-inner textarea"), 'keyup change paste', function () {
        if (!BD.settingsCookie["bda-es-4"]) return;

        var text = $(".channel-textarea-inner textarea").val();

        if (text == undefined) return;

        var lastWord = text.split(" ").pop();
        if (lastWord.length > 3) {
            if (lastWord == "danSgame") return;
            var ret = self.capitalize(lastWord.toLowerCase());
            if (ret !== null && ret !== undefined) {
                $(".channel-textarea-inner textarea").val(text.replace(lastWord, ret));
            }
        }
    });
};

EmoteModule.prototype.capitalize = function (value) {
    var res = this.emotes.twitchGlobal.emotes;
    for (var p in res) {
        if (res.hasOwnProperty(p) && value == (p + '').toLowerCase()) {
            return p;
        }
    }
};