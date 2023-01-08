import Client from "./modules/client";
import DiscordPreload from "./modules/preload";
import RemoteModule from "./remote";

if (process.env.DEVELOPMENT) {
    console.log("Hello from @betterdiscord/preload.");
}

RemoteModule.exposeFunctions();
DiscordPreload.load();
Client.load();

window.require = require;
