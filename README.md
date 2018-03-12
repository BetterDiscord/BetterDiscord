# BandagedBD

BandagedBD (Bandaged BetterDiscord) is a fork of the original [BetterDiscord](https://github.com/Jiiks/BetterDiscordApp) by Jiiks. This has a number of improvements over the original which is currently undergoing a full rewrite. In the interim, the current version has been unmaintained hence this fork existing. I will continue to maintain this fork until BDv2 comes out. I am helping to develop BDv2 as well so as release gets closer this fork will become less and less active.

# Installation

### Windows
Grab the `exe` file from the latest release on the [releases page](https://github.com/rauenzi/BetterDiscordApp/releases). Be sure you leave the last checkbox "Use Zere's Fork" checked when installing.

### macOS/OS X
Grab the `zip` file from the latest release on the [releases page](https://github.com/rauenzi/BetterDiscordApp/releases).

### Linux
See this link: https://gist.github.com/ObserverOfTime/d7e60eb9aa7fe837545c8cb77cf31172

# What's Different

## New Settings
![Settings](https://i.zackrauen.com/nkb9Qi.png)

## UI
 - Redesigned plugin and theme cards with additional classes for themes to use
 - Additional tab in settings with additional settings.
 - CustomCSS editor from CodeMirror has been removed due to being bloated and having high cpu usage. Replaced with another lightweight editor


## Plugins/Themes Related
 - Prevent broken plugins from halting BD from loading
 - Speed up the loading process
 - Show startup errors in a modal

![Startup](https://i.zackrauen.com/PwlQcp.gif)

 - Add `try...catch` blocks to help prevent errors from crashing BD and Discord
 - Fix internal functions that some functions rely on such as `onSwitch` and `onMessage`
 - Add `source` and `website` as options for plugin and theme METAs 
 - Allow themes to use spaces and apostrophes in their names
 - Prettier errors in console, useful for debugging

## Emote Module
- Emotes load asynchronously in the background (does not prevent the mod from loading anymore)
- Several bug fixes including tooltips, modifiers and emote menu
- Consolidate emotes to a single file
- Revamp how emotes are injected—speedup

## Misc
 - Fix Minimal Mode
 - Fix React errors when opening settings
 - Fix selected class disappearing when clicking an open tab
 - Create new alert modal for `BdApi`
 - Add toasts as notification option and in `BdApi`
 - Remove most jQuery dependency for speedup
 - Attach to settings when entering from right click
 - Patch PublicServers
