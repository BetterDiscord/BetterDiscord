# BetterDiscordApp
Better Discord App enhances Discord desktop app with new features.

As of JavaScript version 1.4, settings have been moved to Discord settings dialog.

# On connect you will be automatically invited to the BetterDiscord Discord server one time.

![ss](http://i.imgur.com/iesp9UY.png)

![ss](http://i.imgur.com/F9yMSKc.jpg)

## If Discord has updated and the installer hasn't, try replacing the installer index.js with the latest one here: [index.js](https://github.com/Jiiks/BetterDiscordApp/blob/master/NodeInstaller/index.js)

## Windows Universal Installer
* Download the latest installer from https://github.com/Jiiks/BetterDiscordApp/releases/tag/WindowsInstaller
* Follow the instructions
* .NET 4.0 required https://www.microsoft.com/en-us/download/details.aspx?id=30653
* Windows Installer users asar.net https://github.com/Jiiks/asar.net

## Auto Installation
* Download the latest package from [releases](https://github.com/Jiiks/BetterDiscordApp/releases)
* Run the installer
* Hopefully it works.
* Installer requires [node](https://nodejs.org/en/download/) download the binaries and place in the same folder as the installer if you don't have node installed.
* Installer uses [asar](https://github.com/atom/asar) which is bundled with the installer.
* Installer uses [wrench](https://github.com/ryanmcgrath/wrench-js) which is bundled with the installer.

## Manual Installation
* Extract app.asar
* Add BetterDiscord as a dependency
* Add init to Discord load event
* Move BetterDiscord to node_modules


## Features

**Emotes:**
BetterDiscord adds all [Twitch.tv](http://twitch.tv), most [FrankerFaceZ](http://frankerfacez.com) and [BetterTTV](http://betterttv.net) emotes to Discord.
Supported FrankerFaceZ emotes: http://jiiks.net/projects/betterdiscord/ffz/

**Quick Emote Menu:**
Quick Emote Menu adds a menu for quickly adding twitch emotes.

**Emote Autocapitalize:**
Automatically capitalize [Twitch.tv](http://twitch.tv) global emotes.

**Emote Autocomplete:**
Automatically completes/suggests emotes.(soon)

**Minimal Mode:**
Minimal mode makes elements smaller and hides certain elements.

**Voice Chat Mode:**
Only display voice channels

**Public Servers:**
A menu for displaying public servers. [Serverlist](https://github.com/Jiiks/BetterDiscordApp/blob/master/serverlist.json) (Broken)

**Custom CSS**
BetterDiscord supports custom CSS for styling Discord to your liking.

**Spoilers**
Add spoilers to your chat, simply add [!s] to your message.

**Save Logs Locally:**
Save chatlogs locally.(soon)

## Adding you server to public servers
Edit the [Serverlist](https://github.com/Jiiks/BetterDiscordApp/blob/master/serverlist.json) and submit a pull request.

## BetterDiscord Uses the following API's
* https://twitchemotes.com/apidocs for Twitch emotes
* https://api.betterttv.net/emotes for [BetterTTV](https://nightdev.com/betterttv/) emotes

## Credits
* MacOS Installer by [Candunc](https://github.com/Candunc) 
* Emote titles by [pendo324](https://github.com/pendo324)

## License

The MIT License (MIT)

Copyright (c) 2015 Jiiks

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.