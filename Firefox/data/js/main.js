var emotesTwitch = null, emotesTwitchSub = null, emotesFfz = null, emotesBttv = null, emotesBttv2 = null;

var twitchEmoteUrlStart = "https://static-cdn.jtvnw.net/emoticons/v1/";
var twitchEmoteUrlEnd = "/1.0";
var ffzEmoteUrlStart = "https://cdn.frankerfacez.com/emoticon/";
var ffzEmoteUrlEnd = "/1";
var bttvEmoteUrlStart = "https://cdn.betterttv.net/emote/";
var bttvEmoteUrlEnd = "/1x";

var _emoteModule;
function EmoteModule() {
    
}

EmoteModule.prototype.init = function() {
    _emoteModule.loadEmoteData();
};

EmoteModule.prototype.obsCallback = function(mutation) {
    var self = this;
    for(var i = 0 ; i < mutation.addedNodes.length ; ++i) {
        var next = mutation.addedNodes.item(i);
        if (next) {
            var nodes = self.getNodes(next);
            for(var node in nodes) {
                if (nodes.hasOwnProperty(node)) {
                    self.injectEmote(nodes[node]);
                }
            }
        }
    }
};

EmoteModule.prototype.getNodes = function(node) {
    var next;
    var nodes = [];
    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
    
    while((next = treeWalker.nextNode()) != null) {
        nodes.push(next);
    }
    return nodes;
};

EmoteModule.prototype.injectEmote = function(node) {
    
    if (!node.parentElement) {
        return;
    }
    
    var parent = node.parentElement;
    if (parent.tagName != "SPAN") {
        return;
    }
    if(!$(parent.parentElement).hasClass("markup") && !$(parent.parentElement).hasClass("message-content")) { return; }
    
    var parentInnerHTML = parent.innerHTML;
    var words = parentInnerHTML.split(/\s+/g);
    if (!words) {
        return;
    }
    
    words.some(function(word) {
        if (word.length < 4) {
            return;
        }
        if(emotesTwitch != null) {
            if (emotesTwitch.emotes.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) +    "\uFDD9" + word.substr(len * 3) + '" src="' + twitchEmoteUrlStart + emotesTwitch.emotes[word].image_id + twitchEmoteUrlEnd + '" />');
                return;
            }
        }
        if(emotesTwitchSub != null) {
            if (emotesTwitchSub.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) +    "\uFDD9" + word.substr(len * 3) + '" src="' + twitchEmoteUrlStart + emotesTwitchSub[word] + twitchEmoteUrlEnd + '" />');
                return;
            }
        }
        if(emotesFfz != null) {
            if(emotesFfz.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) +    "\uFDD9" + word.substr(len * 3) + '" src="' + ffzEmoteUrlStart + emotesFfz[word] + ffzEmoteUrlEnd + '" />');
                return;
            }
        }
        if(emotesBttv != null) {
            if(emotesBttv.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) +    "\uFDD9" + word.substr(len * 3) + '" src="' + bttvEmoteUrlStart + emotesBttv[word] + bttvEmoteUrlEnd + '" />');
                return;
            }
        }
        if(emotesBttv2 != null) {
            if(emotesBttv2.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) +    "\uFDD9" + word.substr(len * 3) + '" src="' + bttvEmoteUrlStart + emotesBttv2[word] + bttvEmoteUrlEnd + '" />');
                return;
            }
        }
    });
    
    parent.innerHTML = parentInnerHTML.replace(new RegExp("\uFDD9", "g"), "");
};

EmoteModule.prototype.loadEmoteData = function(type) {
    if(_hash == null) {
        _utils.getHash(this.loadEmoteData);
        return;
    }
    
    switch(type) {
        default:
            _emoteModule.loadEmoteData("twitch");
        break;
        case "twitch":
            _utils.log("Loading twitch global emotes");
            $.getJSON('https://twitchemotes.com/api_cache/v2/global.json', function(data) {
                _utils.log("Loaded twitch global emotes");
                emotesTwitch = data;
                _emoteModule.loadEmoteData("twitch-sub");
            });
        break;
        case "twitch-sub":
            emotesTwitchSub = {};
            _utils.log("Loading twitch subscriber emotes");
            $.getJSON('https://twitchemotes.com/api_cache/v2/subscriber.json', function(data) {
               $.each(data.channels, function(key, val){
                   $.each(val.emotes, function(key, val) {
                      emotesTwitchSub[val.code] = val.image_id;
                   });
               });
               
               _emoteModule.loadEmoteData("ffz");
            });
        break;
        case "ffz":
            emotesFfz = {};
            _utils.log("Loading FFZ emotes");
            $.getJSON('https://cdn.rawgit.com/Jiiks/BetterDiscordApp/'+_hash+'/data/emotedata_ffz.json', function(data) {
                emotesFfz = data;
                _emoteModule.loadEmoteData("bttv");
            });
        break;
        case "bttv":
            emotesBttv = {};
            _utils.log("Loading Basic BTTV emotes");
            $.getJSON('https://api.betterttv.net/2/emotes', function(data) {
                $.each(data.emotes, function(key, val) {
                    emotesBttv[val.code] = val.id;
                });
                _emoteModule.loadEmoteData("bttv2");
            });
        break;
        case "bttv2":
            emotesBttv2 = {};
            _utils.log("Loading BTTV emotes");
            $.getJSON('https://cdn.rawgit.com/Jiiks/BetterDiscordApp/'+_hash+'/data/emotedata_bttv.json', function(data) {
                emotesBttv2 = data;
            });
        break;
    }
};

var _utils;

var _hash = null;
function Utils() {}

Utils.prototype.getHash = function(callback) {
    _utils.log("Getting HASH");
    $.getJSON("https://api.github.com/repos/Jiiks/BetterDiscordApp/commits/master", function(data){
        _hash = data.sha;
        _utils.log("HASH = " + _hash);
        callback();
    });
};

Utils.prototype.log = function(message) {
     console.log("[BetterDiscord] - " + message);
};

(function() {
    
  _utils = new Utils();

  _emoteModule = new EmoteModule();
  _emoteModule.init();
  
  var mainObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            _emoteModule.obsCallback(mutation);
        });
  });
    
  mainObserver.observe(document, { childList: true, subtree: true });
  
})();