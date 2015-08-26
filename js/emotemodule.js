/* BetterDiscordApp EmoteModule JavaScript
 * Version: 1.2
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:46
 * Last Updated: 26/08/2015 - 15:49
 * https://github.com/Jiiks/BetterDiscordApp
 */

var ffzEnabled = false;
var bttvEnabled = false;

function EmoteModule() {

}

EmoteModule.prototype.init = function() {
    var self = this;
    this.emoteObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            for(var i = 0 ; i < mutation.addedNodes.length ; ++i) {
                var next = mutation.addedNodes.item(i);
                if(next) {
                    var nodes = self.getNodes(next);
                    for(var node in nodes) {
                        self.injectEmote(nodes[node]);
                    }
                }
            }
        });
    });
}

EmoteModule.prototype.observe = function() {
    this.emoteObserver.observe(document, { childList: true, subtree: true });
}

EmoteModule.prototype.getNodes = function(node) {
    var next;
    var nodes = [];

    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

    while(next = treeWalker.nextNode()) {
        nodes.push(next);
    }

    return nodes;
}


EmoteModule.prototype.injectEmote = function(node) {

    if(typeof emotesTwitch === 'undefined') return;

    if(!node.parentElement) return;

    var parent = node.parentElement;
    if(parent.tagName != "SPAN") return;

    var parentInnerHTML = parent.innerHTML;
    var words = parentInnerHTML.split(" ");

    if(!words) return;

    words.some(function(word) {
        if (emotesTwitch.hasOwnProperty(word)) {
            parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + twitchEmoteUrlStart + emotesTwitch[word] + twitchEmoteUrlEnd + " title="+word+"><\/img>");
        } else if(typeof emotesFfz !== 'undefined' && ffzEnabled) {
            if(emotesFfz.hasOwnProperty(word)) {
                parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + ffzEmoteUrlStart + emotesFfz[word] + ffzEmoteUrlEnd + " title="+word+"><\/img>");
            } else if(typeof emotesBTTV !== 'undefined' && bttvEnabled) {
                if(emotesBTTV.hasOwnProperty(word)) {
                    parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + bttvEmoteUrlStart + emotesBTTV[word] + bttvEmoteUrlEnd + " title="+word+"><\/img>");
                }
            }
        }
    });

    parent.innerHTML = parentInnerHTML;
}