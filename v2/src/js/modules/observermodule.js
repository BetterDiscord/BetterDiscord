/* BetterDiscordApp Client Observer
 * Version: 2:1.0
 * Author: Jiiks | https://jiiks.net
 * Date: 31/10/2016
 * Last Update: 31/10/2016
 * Github: https://github.com/Jiiks/BetterDiscordApp
 * Git: https://github.com/Jiiks/BetterDiscordApp.git
 * License: MIT
 */
 
define([], () => {
    
    class Observer {
        
        constructor() {
            this.mutationObserver = new MutationObserver(this.observe);
            this.mutationObserver.observe(document, {
                childList: true,
                subtree: true
            });
        }
        
        observe(mutations) {
            
            mutations.forEach(mutation => {
                BD.event.emit("raw-mutation", mutation);
            });
            
        }
        
    }
    
    return new Observer();
});