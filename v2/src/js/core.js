/* BetterDiscordApp Client Core
 * Version: 2:1.0
 * Author: Jiiks | https://jiiks.net
 * Date: 31/10/2016
 * Last Update: 31/10/2016
 * Github: https://github.com/Jiiks/BetterDiscordApp
 * Git: https://github.com/Jiiks/BetterDiscordApp.git
 * License: MIT
 */
 
 
define([
    "./modules/modules",
    "./utils",
    "./api"
], (modules, utils, api) => {
    
    class Core {
        
        constructor(args) {
            this.beta = true;
            this.alpha = true;
        }
        
        init() {
            console.log("Initialized");
        }
        
        get __version() {
            return "2.0.0";
        }
        
        get __versionString() {
            return `${this.__version}${this.alpha ? "A" : this.beta ? "B" : ""}`;
        }
        
    }
    
    window.$B = s => { return $(`[data-bd=${s}`); };
    window.BD = new Core();
    
    window.BD.init();
    
});