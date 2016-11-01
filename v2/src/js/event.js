/* BetterDiscordApp Event emitter
 * Version: 2:1.0
 * Author: Jiiks | https://jiiks.net
 * Date: 31/10/2016
 * Last Update: 31/10/2016
 * Github: https://github.com/Jiiks/BetterDiscordApp
 * Git: https://github.com/Jiiks/BetterDiscordApp.git
 * License: MIT
 */
 
 
define(() => {

     const eventEmitter = new require('events').EventEmitter;
     
     class event {
         
         on(eventName, callback) {
             eventEmitter.on(eventName, callback);
         }
         
         emit() {
             return "Not allowed";
         }
         
     }
     
     return new event();
});