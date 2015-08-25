var observer;

(function() {

    observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            for(var i = 0 ; i < mutation.addedNodes.length ; ++i) {
                var next = mutation.addedNodes.item(i);
                console.log(next);
            }
        });
    });

    obsever.observe(document, {childList: true, subtree: true});

})();
