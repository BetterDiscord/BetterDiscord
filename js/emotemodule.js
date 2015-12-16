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
var emotesTwitch = { "emotes": { "emote": { "image_id": 0 } } }; //for ide
var subEmotesTwitch = {};

function EmoteModule() {
}

EmoteModule.prototype.init = function() {
};

EmoteModule.prototype.getBlacklist = function() {
    $.getJSON("https://cdn.rawgit.com/Jiiks/betterDiscordApp/"+_hash+"/emotefilter.json", function(data) { bemotes = data.blacklist; });
};

EmoteModule.prototype.obsCallback = function(mutation) {
    var self = this;

    if(!settingsCookie["bda-es-7"]) return;

    for(var i = 0 ; i < mutation.addedNodes.length ; ++i) {
        var next = mutation.addedNodes.item(i);
        if(next) {
            var nodes = self.getNodes(next);
            for(var node in nodes) {
                if(nodes.hasOwnProperty(node)) {
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

    while(next = treeWalker.nextNode()) {
        nodes.push(next);
    }


    return nodes;
};

var bemotes = [];
var spoilered = [];

EmoteModule.prototype.injectEmote = function(node) {

    if(typeof emotesTwitch === 'undefined') return;

    if(!node.parentElement) return;

    var parent = node.parentElement;

    if(parent.tagName != "SPAN") return;
  
    var edited = false;
    
    if($(parent.parentElement).hasClass("edited")) {
        parent = parent.parentElement.parentElement.firstChild; //:D
        edited = true;
    }
    
    //if(!$(parent.parentElement).hasClass("markup") && !$(parent.parentElement).hasClass("message-content")) return;

    function inject() {
        if(!$(parent.parentElement).hasClass("markup") && !$(parent.parentElement).hasClass("message-content")) { return; }

        var parentInnerHTML = parent.innerHTML;
        var words = parentInnerHTML.split(/\s+/g);

        if(!words) return;

        words.some(function(word) {

            if(word.slice(0, 4) == "[!s]" ) {

                parentInnerHTML = parentInnerHTML.replace("[!s]", "");
                var markup = $(parent).parent();
                var reactId = markup.attr("data-reactid");
                
                if(spoilered.indexOf(reactId) > -1) {
                    return;
                }

                markup.addClass("spoiler");
                markup.on("click", function() {
                    $(this).removeClass("spoiler");
                    spoilered.push($(this).attr("data-reactid"));
                });

                return;
            }
        
            if(word.length < 4) {
                return;
            }

            if($.inArray(word, bemotes) != -1) return;

            if (emotesTwitch.emotes.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                parentInnerHTML = parentInnerHTML.replace(word, '<img class="emote" alt="' + word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3) + '" src="' + twitchEmoteUrlStart + emotesTwitch.emotes[word].image_id + twitchEmoteUrlEnd + '" />');
                return;
            }

            if (typeof emotesFfz !== 'undefined' && settingsCookie["bda-es-1"]) {
                if (emotesFfz.hasOwnProperty(word)) {
                    var len = Math.round(word.length / 4);
                    var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
                    var url = ffzEmoteUrlStart + emotesFfz[word] + ffzEmoteUrlEnd;
                    
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote" alt="' + name + '" src="' + url + '" /><input onclick=\'quickEmoteMenu.favorite(\"'+name+'\", \"'+url+'\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }

            if (typeof emotesBTTV !== 'undefined' && settingsCookie["bda-es-2"]) {
                if (emotesBTTV.hasOwnProperty(word)) {
                    var len = Math.round(word.length / 4);
                    var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
                    var url = emotesBTTV[word];
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote" alt="' + name + '" src="' + url + '" /><input onclick=\'quickEmoteMenu.favorite(\"'+name+'\", \"'+url+'\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }
              
            if(typeof emotesBTTV2 !== 'undefined' && settingsCookie["bda-es-2"]) {
                if(emotesBTTV2.hasOwnProperty(word)) {
                    var len = Math.round(word.length / 4);
                    var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
                    var url = bttvEmoteUrlStart + emotesBTTV2[word]  + bttvEmoteUrlEnd;
                    parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote" alt="' + name + '" src="' + url + '" /><input onclick=\'quickEmoteMenu.favorite(\"'+name+'\", \"'+url+'\");\' class="fav" title="Favorite!" type="button"></div>');
                    return;
                }
            }

            if (subEmotesTwitch.hasOwnProperty(word)) {
                var len = Math.round(word.length / 4);
                var name = word.substr(0, len) + "\uFDD9" + word.substr(len, len) + "\uFDD9" + word.substr(len * 2, len) + "\uFDD9" + word.substr(len * 3);
                var url = twitchEmoteUrlStart + subEmotesTwitch[word] + twitchEmoteUrlEnd;
                parentInnerHTML = parentInnerHTML.replace(word, '<div class="emotewrapper"><img class="emote" alt="' + name + '" src="' + url + '" /><input onclick=\'quickEmoteMenu.favorite(\"'+name+'\", \"'+url+'\");\' class="fav" title="Favorite!" type="button"></div>');
                return;
            }
        });

        if(parent.parentElement == null) return;

        var oldHeight = parent.parentElement.offsetHeight;
        parent.innerHTML = parentInnerHTML.replace(new RegExp("\uFDD9", "g"), "");
        var newHeight = parent.parentElement.offsetHeight;

        //Scrollfix
        var scrollPane = $(".scroller.messages").first();
        scrollPane.scrollTop(scrollPane.scrollTop() + (newHeight - oldHeight));
   } 
   
   if(edited) {
       setTimeout(inject, 250);
   } else {
       inject();
   }
   
};

EmoteModule.prototype.autoCapitalize = function() {

    var self = this;

    $('body').delegate($(".channel-textarea-inner textarea"), 'keyup change paste', function() {
        if(!settingsCookie["bda-es-4"]) return;

        var text = $(".channel-textarea-inner textarea").val();

        if(text == undefined) return;

        var lastWord = text.split(" ").pop();
        if(lastWord.length > 3) {
            var ret = self.capitalize(lastWord.toLowerCase());
            if(ret != null) {
                $(".channel-textarea-inner textarea").val(text.replace(lastWord, ret));
            }
        }
    });
};

EmoteModule.prototype.capitalize = function(value) {
    var res = emotesTwitch.emotes;
    for(var p in res){
        if(res.hasOwnProperty(p) && value == (p+ '').toLowerCase()){
            return p;
        }
    }
};