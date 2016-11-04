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
            console.log(`%c[BD] %cINF >> %c${msg}`, 'color:#3e82e5; font-weight:700', 'color:green; font-weight:700', '')
        }
        
        warn(msg) {
            console.log(`%c[BD] %cWRN >> %c${msg}`, 'color:#3e82e5; font-weight:700', 'color:orange; font-weight:700', '')
        }
        
        err(msg) {
            console.log(`%c[BD] %cERR >> %c${msg}`, 'color:#3e82e5; font-weight:700', 'color:red; font-weight:700', '')
        }
        
        get dateString() {
            return new Date().toLocaleString("en-GB");
        }
        
        get timeString() {
            return new Date().toTimeString().split(' ')[0];
        }
        
    }
    
    return new Utils();
    
});