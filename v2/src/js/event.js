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

    const EventEmitter = new require('events').EventEmitter;

     class Event {
         
         constructor() {
             this.eventEmitter = new EventEmitter;
         }
         
         on(eventName, callback) {
             this.eventEmitter.on(eventName, callback);
         }
         
         emit(...args) {
             this.eventEmitter.emit(...args);
         }
         
     }
     
     return new Event();
});