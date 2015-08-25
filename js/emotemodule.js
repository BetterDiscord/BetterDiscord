var observer;

(function() {

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

    observer.observe(document, {childList: true, subtree: true});

})();

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
            parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + twitchEmoteUrlStart + emotesTwitch[word] + twitchEmoteUrlEnd + "><\/img>");
        } else if(typeof emotesFfz !== 'undefined') {
            if(emotesFfz.hasOwnProperty(word)) {
                parentInnerHTML = parentInnerHTML.replace(word, "<img src=" + ffzEmoteUrlStart + emotesFfz[word] + ffzEmoteUrlEnd + "><\/img>");
            }
        }
    });

    parent.innerHTML = parentInnerHTML;

}
