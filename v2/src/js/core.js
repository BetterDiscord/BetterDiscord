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
    "./api",
    "./plugin",
    "./event"
], (modules, utils, api, plugin, event) => {
    
    class Core {
        
        constructor(args) {
            console.log(event);
            this.event = event;
            this.modules = modules;
            this.beta = true;
            this.alpha = true;
            this.plugin = plugin;
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
    BD.init();

});