/* BetterDiscordApp EmoteModule JavaScript
 * Version: 1.1
 * Author: Jiiks | http://jiiks.net
 * Date: 26/08/2015 - 11:46
 * https://github.com/Jiiks/BetterDiscordApp
 */

var observer;
var emotesTwitch = {};
var ffzEnabled = false;
var bttvEnabled = false;
var emotesFfz = {};
var emotesBTTV = {};

function startEmoteModule() {
    observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            for(var i = 0 ; i < mutation.addedNodes.length ; ++i) {
                var next = mutation.addedNodes.item(i);
                if(next) {
                    var nodes = getNodes(next);
                    for(var node in nodes) {
                        injectEmote(nodes[node]);
                    }
                }
            }
        });
    });
}

function startEmoteObserver() {
    observer.observe(document, {childList: true, subtree: true});
}

function getNodes(node) {
    var next;
    var nodes = [];

    var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);

    while(next = treeWalker.nextNode()) {
        nodes.push(next);
    }

    return nodes;
}

function injectEmote(node) {

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