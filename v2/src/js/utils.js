/* BetterDiscordApp Client Utilities
 * Version: 2:1.0
 * Author: Jiiks | https://jiiks.net
 * Date: 31/10/2016
 * Last Update: 31/10/2016
 * Github: https://github.com/Jiiks/BetterDiscordApp
 * Git: https://github.com/Jiiks/BetterDiscordApp.git
 * License: MIT
 */
 
 
define(() => {
    
    class Utils {
        
        constructor() {
            
        }
        
        log(msg) {
            console.log(`%c[%cBetterDiscord|INF%c] %c${msg}`, 'color: #000;', 'color: green; font-weight:#000;', 'color:#00;', '');
        }
        
        warn(msg) {
            console.log(`%c[%cBetterDiscord|WRN%c] %c${msg}`, 'color: #000;', 'color: orange; font-weight:700;', 'color:#000;', '');
        }
        
        err(msg) {
            console.log(`%c[%cBetterDiscord|ERR%c] %c${msg}`, 'color: #000;', 'color: red; font-weight:700;', 'color:#000;', '');
        }
        
    }
    
    return new Utils();
    
});