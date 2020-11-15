# BetterDiscord [![Build Status][travis-badge]][travis-link] [![Language Grade][lgtm-badge]][lgtm-link] ![GitHub Releases][downloads-badge] 

[patreon-badge]: https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2FZerebos&style=flat-square
[patreon-link]: https://patreon.com/Zerebos

[paypal-badge]: https://img.shields.io/badge/Paypal-Donate!-%2300457C.svg?logo=paypal&style=flat-square
[paypal-link]: https://paypal.me/ZackRauen

[lgtm-badge]: https://img.shields.io/lgtm/grade/javascript/g/rauenzi/BetterDiscordApp.svg?style=flat-square
[lgtm-link]: https://lgtm.com/projects/g/rauenzi/BetterDiscordApp/context:javascript

[travis-badge]: https://img.shields.io/travis/com/rauenzi/BetterDiscordApp.svg?style=flat-square&branch=stable
[travis-link]: https://travis-ci.com/rauenzi/BetterDiscordApp

[downloads-badge]: https://img.shields.io/github/downloads/rauenzi/BetterDiscordApp/latest/total?style=flat-square



[![Patreon][patreon-badge]][patreon-link] [![Paypal][paypal-badge]][paypal-link]

BetterDiscord is a client modification for Discord. This allows you to add plugins and themes to your personal copy of Discord. BetterDiscord also adds a number of other features out of the box.

# Installation

## Auto Installers

### Windows
Grab the `exe` file from [here](https://github.com/rauenzi/BBDInstaller/releases/latest/download/BandagedBD.exe).

### macOS/OS X
Grab the `zip` file from [here](https://github.com/rauenzi/BBDInstaller/releases/latest/download/BandagedBD_Mac.zip).

### Linux
See this [gist](https://gist.github.com/ObserverOfTime/d7e60eb9aa7fe837545c8cb77cf31172).

## Manual Installation

### Windows
1. Download and extract this: https://github.com/rauenzi/BetterDiscordApp/archive/injector.zip
2. Rename `BetterDiscordApp-injector` to `app`.
3. Go to `%localappdata%\Discord\`, and locate the directory with the largest version number (e.g. `app-0.0.306`).
4. Within `app-0.0.306` navigate to `resources`.
5. If an `app` folder already exists inside `resources`, delete it.
6. Move the `app` folder (the one you downloaded and renamed) inside of `resources`.
7. Fully quit Discord and restart it.

### macOS/OS X
1. Download and extract this: https://github.com/rauenzi/BetterDiscordApp/archive/injector.zip
2. Rename `BetterDiscordApp-injector` to `app`.
3. Go to `/Applications/`, right click `Discord.app` and select `Show Package Contents`.
4. Within `Discord.app` navigate to `Contents` -> `Resources`.
5. If an `app` folder already exists inside `Resources`, delete it.
6. Move the `app` folder (the one you downloaded and renamed) inside of `Resources`.
7. Fully quit Discord and restart it.

## Local Installation

By default BD loads majority of the package through a CDN at runtime so you always have the latest version. However, if you'd rather only load something from your PC and update when you want, you can do that too!

**Prerequisites**: [Node.js](https://nodejs.org/en/) 12.x+ and the package manager [npm](https://www.npmjs.com/).

1. Clone this repository `git clone https://github.com/rauenzi/BetterDiscordApp.git`
2. Install dependencies with `npm install`
3. Build both the JavaScript and CSS bundles with `npm run deploy` this will create a `style.css` and `remote.js` in the `dist` folder.
4. Follow the steps for [manual installation](#manual-installation) from before.
5. Inside the `app` folder you created as a part of that process, find the file `betterdiscord\config.json`
6. Edit the file and change the value of `local` to `true` and change the `localPath` value to match the <u>absolute</u> path of the `dist` folder from step 3.
7. Fully quit Discord and restart it.

# FAQ

### What is this?
This is a client modification for Discord. It allows you to add plugins and themes to your client. Plugins can add functionality and useful features. Themes can completely change the look and feel of Discord.

BD has some other built-in features such as Emotes from Twitch, FFZ, and BBTV, as well as an in-client server browser.

### Where can I get plugins and themes?
In our support servers we have channels with lists of <u>official</u> plugins and themes. Please note we do not have an official listing on a website and are **not affiliated with any of those websites**. However [BetterDiscordLibrary](https://betterdiscordlibrary.com/) is generally trustworthy.

### Support Servers?
There are two: [The main server](https://discord.gg/0Tmfo5ZbORCRqbAd), and [the backup](https://discord.gg/2HScm8j).



# Supporters
These people have all subscribed to the `True Supporter` tier on Patreon to support me.

<table>
<tr>
<td align="center">
    <img src="https://cdn.discordapp.com/avatars/196098063092154368/90f1a7202955dac7a6c685cca3181ab1.webp" width="100px;" alt="Kraken"/><br />
    <strong>Kraken</strong><br />
</td>
<td align="center">
    <img src="https://cdn.discordapp.com/attachments/585514483699417089/585552300354043915/34959069_500_500.jpg" width="100px;" alt="SPHHAX"/><br />
    <a href="http://sphh.ax/" target="_blank" rel="noreferrer noopener"><strong>SPHHAX</strong></a><br />
</td>
<td align="center">
    <img src="https://cdn.discordapp.com/attachments/622954403262889995/622957122765848587/5364774.jpg" width="100px;" alt="DefCon42"/><br />
    <a href="https://twitter.com/def_con42" target="_blank" rel="noreferrer noopener"><strong>DefCon42</strong></a><br />
</td>
<td align="center">
    <img src="https://cdn.discordapp.com/avatars/629231564261425163/a_36cc7d2940b4ffb8a660b1076ab2087f.webp" width="100px;" alt="Justxn"/><br />
    <strong>Justxn</strong><br />
</td>
<td align="center">
    <img src="https://cdn.discordapp.com/attachments/682750073448169513/682763113296429087/definitely_not_the_dick_police.png" width="100px;" alt="monkey"/><br />
    <a href="https://heartunderbla.de" target="_blank" rel="noreferrer noopener"><strong>monkey</strong></a><br />
</td>
<td align="center">
    <img src="https://avatars3.githubusercontent.com/u/20338746?s=460&u=d9ebab4f6f0f5221390bca1eaf8f191acd275afe&v=4" width="100px;" alt="Gibbu"/><br />
    <a href="https://github.com/Gibbu" target="_blank" rel="noreferrer noopener"><strong>Gibbu</strong></a>
</td>
<td align="center">
    <img src="https://i.imgur.com/ImS2OCB.png" width="100px;" alt="Orekieh"/><br />
    <strong>Orekieh</strong>
</td>
</tr>
</table>


# Bandagers
These people have all subscribed to the `Bandager` tier on Patreon to support me.


<table>
<tr>
    <td align="center">
        <img src="https://cdn.discordapp.com/avatars/332199319169925120/4709f8f0c9cb7ababd85459bf71848b9.png" width="50px;" alt="William JCM"/><br />
        <a href="https://github.com/williamjcm" target="_blank" rel="noreferrer noopener"><strong>William JCM</strong></a>
    </td>
    <td align="center">
        <img src="https://avatars0.githubusercontent.com/u/24623601" width="50px;" alt="NFLD99"/><br />
        <a href="https://github.com/NFLD99" target="_blank" rel="noreferrer noopener"><strong>NFLD99</strong></a>
    </td>
    <td align="center">
        <img src="https://i.postimg.cc/5NVxqMnb/Cute-Squid-Circle.png" width="50px;" alt="Tenuit"/><br />
        <strong>Tenuit</strong>
    </td>
    <td align="center">
        <img src="https://avatars0.githubusercontent.com/u/16616715" width="50px;" alt="Pu"/><br />
        <a href="https://github.com/Puv1s" target="_blank" rel="noreferrer noopener"><strong>Pu</strong></a>
    </td>
    <td align="center">
        <img src="https://cdn.discordapp.com/attachments/769608503496278036/769680733693804625/tacoindustries.jpg" width="50px;" alt="Paco"/><br />
        <strong>Paco</strong>
    </td>
</tr>
</table>

# Donors
These people have either donated or subscribed to the most basic patron tier to support me.

<table>
<tr>
    <td align="center">
        <img src="https://cdn.discordapp.com/avatars/284122164582416385/ebaa1b63191ce70e48ae24f32f452773.webp" width="25px;" /><br />
        <strong>aetheryx</strong>
    </td>
    <td align="center">
        <img src="https://cdn.discordapp.com/avatars/216782345779281921/d4b651b606f108cd2f96a19af68f942f.png" width="25px;" /><br />
        <strong>JBeauDee</strong>
    </td>
        <td align="center">
        <img src="https://cdn.discordapp.com/avatars/261673576216789004/31d590fb92329e270a6225a13d500c1d.png" width="25px;" /><br />
        <strong>vantiss</strong>
    </td>
        <td align="center">
        <img src="https://cdn.discordapp.com/avatars/122204411962327043/7f44a9b036b9e2691f4e81d9e34a78b4.webp" width="25px;" /><br />
        <strong>xstefen</strong>
    </td>
    <td align="center">
        <img src="https://cdn.discordapp.com/avatars/219400174869413888/7c88015869990ba97b614b1ac784f8e8.png" width="25px;" /><br />
        <strong>『Sorey』</strong>
    </td>
    <td align="center">
        <img src="https://cdn.discordapp.com/avatars/95263213842608128/5024b83e1bff3096d7fc93e8de09d582.gif" width="25px;" /><br />
        <strong>LiVeR</strong>
    </td>
    <td align="center">
        <img src="https://cdn.discordapp.com/avatars/144458450192171008/13a3e66d73d216974504b8aad257b7b4.png" width="25px;" /><br />
        <strong>SweetLilyCake</strong>
    </td>
    <td align="center">
        <img src="https://cdn.discordapp.com/avatars/398951709336010793/eb6f63eb2f3a5102fb900e60d1a26cdc.png" width="25px;" /><br />
        <strong>GameKuchen</strong>
    </td>
    <td align="center">
        <img src="https://i.imgur.com/qrWcKfH.png" width="25px;" /><br />
        <strong>Lozo</strong>
    </td>
    <td align="center">
        <img src="https://media.discordapp.net/attachments/575576868166828032/692136786893340752/pfp.gif" width="25px;" /><br />
        <strong>Akira</strong>
    </td>
</tr>
</table>