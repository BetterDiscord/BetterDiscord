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

var emotesFfz = {};
var emotesBTTV = {};
var emotesTwitch = {
    "emotes": {
        "emote": {
            "image_id": 0
        }
    }
}; //for ide
var subEmotesTwitch = {};

function EmoteModule() {}

EmoteModule.prototype.init = function () {};

EmoteModule.prototype.getBlacklist = function () {
    $.getJSON("https://cdn.rawgit.com/Jiiks/betterDiscordApp/" + _hash + "/data/emotefilter.json", function (data) {
        bemotes = data.blacklist;
    });
};

EmoteModule.prototype.obsCallback = function (mutation) {
    var self = this;

    //if (!settingsCookie["bda-es-7"]) return;

    $(".emoji").each(function() {
        var t = $(this);
        if(t.attr("src").indexOf(".png") != -1) {
            t.replaceWith(t.attr("alt"));
        }
    });

    for (var i = 0; i < mutation.addedNodes.length; ++i) {
        var next = mutation.addedNodes.item(i);
        if (next) {
            var nodes = self.getNodes(next);
            for (var node in nodes) {
                if (nodes.hasOwnProperty(node)) {
                    var elem = nodes[node].parentElement;
                    if (elem && elem.classList.contains('edited')) {
                        self.injectEmote(elem);
                    } else {
                        self.injectEmote(nodes[node]);
                    }
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

var bemotes = [];
var spoilered = [];


EmoteModule.prototype.injectEmote = function(node) {
    var self = this;

    if (!node.parentElement) return;
    var parent = $(node).parent();
    
    if(!parent.hasClass("markup") && !parent.hasClass("message-content")) return;


    function inject() {
        var contents = parent.contents();
        
        contents.each(function(i) {
            if(contents[i] == undefined) return;
            var nodeValue = contents[i].nodeValue;
            if(nodeValue == null) return;
            //if(nodeValue.indexOf("react-") > -1) return;
            if(contents[i].nodeType == 8) return;
            contents.splice(i, 1);

            var words = nodeValue.split(/([^\s]+)([\s]|$)/g).filter(function(e){ return e});
            
            var splice = 0;

            var doInject = false;
            var text = null;

            words.forEach(function(w, index, a) {
                
                if(w.indexOf("[!s]") > -1) {
                    w = w.replace("[!s]", "");
                    parent.data("spoilered", false);
                    parent.addClass("spoiler");
                }
                
                var allowedClasses = ["flip", "spin", "pulse", "spin2", "spin3", "1spin", "2spin", "3spin", "tr", "bl", "br", "shake", "shake2", "shake3", "flap"];
                var useEmoteClass = false;
                var emoteClass = "";
                var skipffz = false;
                
                var sw = w;
                
                if(w.indexOf(":") > -1) {
                    var split = w.split(":");
                    if(split[0] != "" && split[1] != "") {
                        if(allowedClasses.indexOf(split[1]) > -1) {
                            sw = split[0];
                            emoteClass = settingsCookie["bda-es-8"] ? "emote" + split[1] : "";
                        }
                        if(split[1] == "bttv") {
                            sw = split[0];
                            skipffz = true;
                        }
                    }
                }
                
                if ($.inArray(sw, bemotes) != -1) return;
                
                if(typeof emotesTwitch !== 'undefind' && settingsCookie["bda-es-7"]) {
                    if(emotesTwitch.emotes.hasOwnProperty(sw) && sw.length >= 4) { 
                        if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                        var url = twitchEmoteUrlStart + emotesTwitch.emotes[sw].image_id + twitchEmoteUrlEnd;
                        contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                        doInject = true;
                        return;
                    }
                }
                
                if(typeof subEmotesTwitch !== 'undefined' && settingsCookie["bda-es-7"]) {
                    if(subEmotesTwitch.hasOwnProperty(sw) && sw.length >= 4) {
                        if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                        var url = twitchEmoteUrlStart + subEmotesTwitch[sw] + twitchEmoteUrlEnd;
                        contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                        doInject = true;
                        return;
                    }
                }
                
                if (typeof emotesBTTV !== 'undefined' && settingsCookie["bda-es-2"]) { 
                    if(emotesBTTV.hasOwnProperty(sw) && sw.length >= 4) {
                        if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                        var url = emotesBTTV[sw];
                        contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                        doInject = true;
                        return;
                    }
                }
                
                if ((typeof emotesFfz !== 'undefined' && settingsCookie["bda-es-1"]) && (!skipffz || !emotesBTTV2.hasOwnProperty(sw))) { 
                    if(emotesFfz.hasOwnProperty(sw) && sw.length >= 4) {
                        if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                        var url = ffzEmoteUrlStart + emotesFfz[sw] + ffzEmoteUrlEnd;
                        contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                        doInject = true;
                        return;
                    }
                }

                if (typeof emotesBTTV2 !== 'undefined' && settingsCookie["bda-es-2"]) { 
                    if(emotesBTTV2.hasOwnProperty(sw) && sw.length >= 4) {
                        if(text != null) { contents.splice(i + splice++, 0, document.createTextNode(text));  text = null;}
                        var url = bttvEmoteUrlStart + emotesBTTV2[sw] + bttvEmoteUrlEnd;
                        if(skipffz && emotesFfz.hasOwnProperty(sw)) sw = sw + ":bttv";
                        contents.splice(i + splice++, 0, self.createEmoteElement(sw, url, emoteClass));
                        doInject = true;
                        return;
                    }
                }
                
                if(text == null) {
                    text = w;
                } else {
                    text += "" + w;
                }

                if(index === a.length - 1) {
                    contents.splice(i + splice, 0, document.createTextNode(text));
                }
            });

            if(doInject) {
                var oldHeight = parent.outerHeight();
                parent.html(contents);
                var scrollPane = $(".scroller.messages").first();
                scrollPane.scrollTop(scrollPane.scrollTop() + (parent.outerHeight() - oldHeight));
            }

        });
    }
    
    inject();
    if(parent.children().hasClass("edited")) {
        setTimeout(inject, 250);
    }

    

};

EmoteModule.prototype.createEmoteElement = function(word, url, mod) {
    var len = Math.round(word.length / 4);
    var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
    var html = '<span class="emotewrapper"><img draggable="false" style="max-height:32px;" class="emote '+ mod +'" alt="' + name + '" src="' + url + '"/><input onclick=\'quickEmoteMenu.favorite(\"' + name + '\", \"' + url + '\");\' class="fav" title="Favorite!" type="button"></span>';
    return $.parseHTML(html.replace(new RegExp("\uFDD9", "g"), ""))[0];
};

EmoteModule.prototype.autoCapitalize = function () {

    var self = this;

    $('body').delegate($(".channel-textarea-inner textarea:first"), 'keyup change paste', function () {
        if (!settingsCookie["bda-es-4"]) return;

        var text = $(".channel-textarea-inner textarea:first").val();
        if (text == undefined) return;

        var lastWord = text.split(" ").pop();
        if (lastWord.length > 3) {
            if (lastWord == "danSgame") return;
            var ret = self.capitalize(lastWord.toLowerCase());
            if (ret !== null && ret !== undefined) {
                $(".channel-textarea-inner textarea:first").val(text.replace(lastWord, ret));
            }
        }
    });
};

EmoteModule.prototype.capitalize = function (value) {
    var res = emotesTwitch.emotes;
    for (var p in res) {
        if (res.hasOwnProperty(p) && value == (p + '').toLowerCase()) {
            return p;
        }
    }
};