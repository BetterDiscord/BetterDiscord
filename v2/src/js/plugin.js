/* BetterDiscordApp Plugin base class
 * Version: 2:1.0
 * Author: Jiiks | https://jiiks.net
 * Date: 31/10/2016
 * Last Update: 31/10/2016
 * Github: https://github.com/Jiiks/BetterDiscordApp
 * Git: https://github.com/Jiiks/BetterDiscordApp.git
 * License: MIT
 */
 
 
define(() => {
    
    class Plugin {
        
	    constructor(args) {
	    	this.info = args;
	    }
    
	    get author() {
	    	return this.info.author;
	    }
    
	    get name() {
	    	return this.info.name;
	    }
    
	    get version() {
	    	return this.info.version;
            
        }
    }
    
    return Plugin;
    
});