# BetterDiscord [![Language Grade][lgtm-badge]][lgtm-link] [![GitHub Releases][downloads-badge]][downloads-link] [![Discord][discord-badge]][discord-link]

[lgtm-badge]: https://img.shields.io/lgtm/grade/javascript/g/BetterDiscord/BetterDiscord.svg?labelColor=0c0d10&style=for-the-badge
[lgtm-link]: https://lgtm.com/projects/g/BetterDiscord/BetterDiscord/context:javascript

[downloads-badge]: https://img.shields.io/github/downloads/BetterDiscord/Installer/total?labelColor=0c0d10&color=3a71c1&style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjI1IDM4LjVIMzUuNzVDMzYuNzE2NSAzOC41IDM3LjUgMzkuMjgzNSAzNy41IDQwLjI1QzM3LjUgNDEuMTY4MiAzNi43OTI5IDQxLjkyMTIgMzUuODkzNSA0MS45OTQyTDM1Ljc1IDQySDEyLjI1QzExLjI4MzUgNDIgMTAuNSA0MS4yMTY1IDEwLjUgNDAuMjVDMTAuNSAzOS4zMzE4IDExLjIwNzEgMzguNTc4OCAxMi4xMDY1IDM4LjUwNThMMTIuMjUgMzguNUgzNS43NUgxMi4yNVpNMjMuNjA2NSA2LjI1NThMMjMuNzUgNi4yNUMyNC42NjgyIDYuMjUgMjUuNDIxMiA2Ljk1NzExIDI1LjQ5NDIgNy44NTY0N0wyNS41IDhWMjkuMzMzTDMwLjI5MzEgMjQuNTQwN0MzMC45NzY1IDIzLjg1NzMgMzIuMDg0NiAyMy44NTczIDMyLjc2OCAyNC41NDA3QzMzLjQ1MTQgMjUuMjI0MiAzMy40NTE0IDI2LjMzMjIgMzIuNzY4IDI3LjAxNTZMMjQuOTg5OCAzNC43OTM4QzI0LjMwNjQgMzUuNDc3MiAyMy4xOTg0IDM1LjQ3NzIgMjIuNTE1IDM0Ljc5MzhMMTQuNzM2OCAyNy4wMTU2QzE0LjA1MzQgMjYuMzMyMiAxNC4wNTM0IDI1LjIyNDIgMTQuNzM2OCAyNC41NDA3QzE1LjQyMDIgMjMuODU3MyAxNi41MjgyIDIzLjg1NzMgMTcuMjExNyAyNC41NDA3TDIyIDI5LjMyOVY4QzIyIDcuMDgxODMgMjIuNzA3MSA2LjMyODgxIDIzLjYwNjUgNi4yNTU4TDIzLjc1IDYuMjVMMjMuNjA2NSA2LjI1NThaIiBmaWxsPSIjM2E3MWMxIi8+Cjwvc3ZnPgo=
[downloads-link]: #auto-installers

[discord-badge]: https://img.shields.io/badge/support%20server-join-green?labelColor=0c0d10&color=7289da&style=for-the-badge&logo=discord&logoColor=7289da
[discord-link]: https://discord.gg/bnSUxedypU

[patreon-badge]: https://img.shields.io/badge/Patreon-Donate-%2300457C.svg?logo=Patreon&logoColor=ff424d&labelColor=0c0d10&color=ff424d&style=for-the-badge
[patreon-link]: https://patreon.com/Zerebos

[paypal-badge]: https://img.shields.io/badge/Paypal-Donate-%2300457C.svg?logo=Paypal&labelColor=0c0d10&color=002f86&style=for-the-badge
[paypal-link]: https://paypal.me/ZackRauen

BetterDiscord is a client modification for Discord. This allows you to add plugins and themes to your personal copy of Discord. BetterDiscord also adds a number of other features out of the box.

---

# Installation

## Auto Installers

[![Windows Installer][windows-badge]][windows-link] [![Mac Installer][mac-badge]][mac-link] [![Linux Installer][linux-badge]][linux-link]

[windows-link]: https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Windows.exe
[windows-badge]: https://img.shields.io/badge/Windows%20(7+)-Download-3a71c1?logo=Windows&logoColor=3a71c1&labelColor=0c0d10&color=3a71c1&style=for-the-badge

[mac-link]: https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Mac.zip
[mac-badge]: https://img.shields.io/badge/macOS%20(10.10+)-Download-3a71c1?logo=Apple&logoColor=3a71c1&labelColor=0c0d10&color=3a71c1&style=for-the-badge

[linux-link]: https://github.com/BetterDiscord/Installer/releases/latest/download/BetterDiscord-Linux.AppImage
[linux-badge]: https://img.shields.io/badge/Linux-Download-3a71c1?logo=Linux&logoColor=3a71c1&labelColor=0c0d10&color=3a71c1&style=for-the-badge

## Manual Installation

For normal users, installing via the installers makes the most sense. However when wanting to either develop BetterDiscord, or when the installers do not work, this option can be used.

### Prerequisites
- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/en/) with `npm`.
- Command line of your choice.

### 1: Clone the repository
```ps
git clone https://github.com/BetterDiscord/BetterDiscord.git
```
### 2: Install dependencies
```ps
npm install
```
### 3: Run Build Script
This will create a `injector.js`, `preload.js`, and `renderer.js` in the `dist` folder.
```ps
npm run build
```
### 4: Inject into your Discord client
#### Install to Stable
```ps
npm run inject
```
#### Install to PTB
```ps
npm run inject ptb
```
#### Install to Canary
```ps
npm run inject canary
```

## Additional Scripts

### Compiling & Distribution
This will create a `betterdiscord.asar` file in the `dist` folder.
```ps
npm run dist
```

---

# FAQ

### What is this?
This is a client modification for Discord. It allows you to add plugins and themes to your client. Plugins can add functionality and useful features. Themes can completely change the look and feel of Discord.

BD has some other built-in features such as Emotes from Twitch, FFZ, and BBTV, as well as an in-client server browser.

### Where can I get plugins and themes?
The easiest way to find plugins and themes is to browse them on [our website: https://betterdiscord.app/](https://betterdiscord.app/). Additionally, in our [support servers](#support-servers) we have channels with lists of <u>official</u> plugins and themes.

### Support Servers?
There are two: [The main server][discord-link], and [the backup](https://discord.gg/XqSpb9e3dq).

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
    <td align="center">
        <img src="https://cdn.discordapp.com/avatars/198801443279339520/4ae8e82ea9b136da4831ca6ac7c5082b.png" width="50px;" alt="Jordan"/><br />
        <a href="https://reddit.com/r/kotlin" target="_blank" rel="noreferrer noopener"><strong>Jordan</strong></a>
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
    <td align="center">
        <img src="https://i.pinimg.com/originals/07/c3/7d/07c37d854719dd633a11ff3f681d2019.jpg" width="25px;" /><br />
        <strong>Pixel</strong>
    </td>
</tr>
</table>

# Contributors

For information on contributing to this project, please see [CONTRIBUTING.md](/CONTRIBUTING.md).

[![Contributors][contributors-image]][contributors-link]

[contributors-image]: https://contrib.rocks/image?repo=betterdiscord/betterdiscord
[contributors-link]: https://github.com/betterdiscord/betterdiscord/graphs/contributors
