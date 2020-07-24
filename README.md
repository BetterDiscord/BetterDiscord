# BandagedBD [![Build Status][travis-badge]][travis-link] ![Netlify][netlify-badge] [![Language Grade][lgtm-badge]][lgtm-link] ![GitHub Releases][downloads-badge] 

[patreon-badge]: https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2FZerebos&style=flat-square
[patreon-link]: https://patreon.com/Zerebos

[paypal-badge]: https://img.shields.io/badge/Paypal-Donate!-%2300457C.svg?logo=paypal&style=flat-square
[paypal-link]: https://paypal.me/ZackRauen

[lgtm-badge]: https://img.shields.io/lgtm/grade/javascript/g/rauenzi/BetterDiscordApp.svg?style=flat-square
[lgtm-link]: https://lgtm.com/projects/g/rauenzi/BetterDiscordApp/context:javascript

[travis-badge]: https://img.shields.io/travis/com/rauenzi/BetterDiscordApp.svg?style=flat-square&branch=development
[travis-link]: https://travis-ci.com/rauenzi/BetterDiscordApp

[netlify-badge]: https://img.shields.io/netlify/0c2be7e5-9327-4243-a2bf-68272c00c253?style=flat-square
[downloads-badge]: https://img.shields.io/github/downloads/rauenzi/BetterDiscordApp/latest/total?style=flat-square

<!-- [![Netlify Status](https://api.netlify.com/api/v1/badges/0c2be7e5-9327-4243-a2bf-68272c00c253/deploy-status)](https://app.netlify.com/sites/vigorous-visvesvaraya-98a425/deploys) -->



[![Patreon][patreon-badge]][patreon-link] [![Paypal][paypal-badge]][paypal-link]

This branch is for the ongoing rewrite of BandagedBD. You can view what I believe to be left in the TODO.md file.

# Testing

The following steps tell you how you can currently test the state of the rewrite as of April 23rd 2020.

1. locate your BD installation. For Windows it is usually in `%localappdata%\Discord\app-0.0.306\resources\app\betterdiscord`.
2. Open config.json in a text editor (n++, notepad, etc).
3. Change the line `"branch": "master",` to `"branch": "development",`.
4. (optional) Change `"minified": true,` to `"minified": false,` to stay on the bleeding edge (sometimes I forget to update the minified version).
5. Fully restart your Discord client.
6. You can verify it worked by seeing the revamped plugins and themes pages as well as custom css. You can also see if the version in settings is 1.0.0+

## Script Version

The above can be automatically done in script form.
```js
((branch = "development", minified = false) => {
try {
    const fs = require("fs");
    const path = require("path");
    const configPath = path.join(DataStore.injectionPath, "betterdiscord", "config.json");
    const config = require(configPath);
    config.branch = branch;
    config.minified = minified;
    console.log(config);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    const app = require("electron").remote.app;
    app.relaunch();
    app.exit();
}
catch (err) {console.error(err);}
})("development", false);