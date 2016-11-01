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
            this.author = args.author;
            this.version = args.version;
        }
        
        get author() {
            return this.author;
        }
        
        get version() {
            return this.version;
        }
        
    }
    
    return Plugin;
    
});