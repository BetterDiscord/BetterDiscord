# BetterDiscord Changelog

This changelog starts with the restructured 1.0.0 release that happened after context isolation changes. The changelogs here should more-or-less mirror the ones that get shown in the client but probably with less formatting and pizzazz.

## 1.5.3

### Added

### Removed

### Changed

### Fixed
- Fixed Canary crashing immediately

## 1.5.2

### Added

### Removed

### Changed

### Fixed
- Fixed being unable to inject into settings, thanks @Strencher

## 1.5.1

### Added
- `Number` settings component using builtin `input[type=number]`
- Settings for monaco editor: font size, line numbers, minimap, whitespace, quick suggestions, tooltips

### Removed

### Changed

### Fixed
- Fixed `GuildComponent` throwing errors
- Fixed public servers button disappearing when guilds list rerenders
- Fixed plugin compilation error not pointing to console
- Fixed plugins with no `@name` attempting to load

## 1.5.0

### Added
- `appSettings` override and corresponding toggle to enable DevTools (Thanks [Kyza](https://github.com/Kyza))
- `bd-transparency` class is added to `document.body` when window transparency is enabled (Thanks [Strencher](https://github.com/Strencher))

### Removed
- Removed all appearance related `Builtin`s including: 24 Hour Timestamps, Colored Text, Hide GIF/Gift Button, and MinimalMode

### Changed

### Fixed
- Fixed `DebugLogs` throwing errors or not writing `null`, `undefined`, and circular objects
- Fixed guild utility classes not being added
- Fixed toast location

## 1.4.0

### Added
- Notices API (Thanks [Strencher](https://github.com/Strencher))

### Removed

### Changed

### Fixed
- Fixed outdates styles and classnames (Thanks [Strencher](https://github.com/Strencher))
- Fixed guild list classes being overwritten causing the public server button to not show
- Fixed finding the wrong module for `ActionTypes` in custom css module
- Fixed not removing customcss upon disable
- Fixed media keys commandline switch not being applied

## 1.3.0

### Added

### Removed

### Changed
- Startup now waits for current user to be populated or for CONNECTION_OPEN event

### Fixed
- Fixed emote menu causing crashes

## 1.2.4

### Added

### Removed

### Changed

### Fixed
- Fixed loading sequence using wrong classes

## 1.2.3

### Added

### Removed

### Changed

### Fixed
- Fixed translations not falling back to English
- Fixed waiting for guilds due to class name changes

## 1.2.2

### Added
- Added Czech translation
- Added Spanish translation
- Added Hindi (partial) translation
- Added Italian translation
- Added Dutch translation
- Added Norwegian translation
- Added Portuguese (PT) translation
- Added Romanian translation
- Added Russian translation
- Added Turkish translation

### Removed

### Changed
- `window.webpackJsonp` is temporarily polyfilled for Canary but _will_ be disappearing
- Updated French translation
- Updated Germand translation

### Fixed
- Fixed public servers missing (Thanks [Strencher](https://github.com/Strencher))
- Fixed guild classes missing (Thanks [Strencher](https://github.com/Strencher))

## 1.2.1

### Added
- Added `getPatchesByCaller` to `BdApi.Patcher`

### Removed

### Changed
- Internal react keys updated for new version in Discord (Thanks [Strencher](https://github.com/Strencher))
- Monaco editor now loads for all cases rather than just for custom css (Thanks [Qb](https://github.com/QbDesu))
- MacOS on Discord non-canary will use the default `process` object

### Fixed
- Fixed failed plugin loads being permanently cached (Thanks [Strencher](https://github.com/Strencher))
- Fixed duplicate file renaming sometimes causing crashed (Thanks [Strencher](https://github.com/Strencher))
- Fixed plugin data retrieval when using falsey values
- Fixed plugin data being overwritten if a read did not occur first
- Fixed react dev tools time of installation to comply with linux injection. (Thanks [Qb](https://github.com/QbDesu))

## 1.2.0

### Added
- `openDialog` function added to `BdApi` to enable save/load of files.

### Removed

### Changed
- Emote menu now more seamlessly integrates with Discord.
- Support for other chrome profiles added when using React DevTools. (Thanks [CrizGames](https://github.com/CrizGames))
- Console errors from plugins should now properly map to the local file.

### Fixed
- Fixed several crashing issues related to voice and video chats.
- Fixed the incompatibility with Canary/PTB
- Fixed missing class names on guild elements.
- Fixed minimal mode for new Discovery tab. (Thanks [dav1312](https://github.com/dav1312))


## 1.1.1

### Added

### Removed

### Changed
- Plugin loader now removes the used `script` tags
- URLs reflect new website

### Fixed
- Fixed an issue with hiding GIF and Gift buttons
- Fixed certain plugin patches not returning values
- Fixed an issue with the settings patch failing


## 1.1.0

### Added
- Added an option to prevent Discord from hijacking the media keys.
- Added command line flag to launch a vanilla version of Discord `--vanilla`
- Added an option for app-wide `ctrl+shift+c` shortcut for inspect element.
- Added emote blocklist to `BdApi` via `BdApi.Emotes.blocklist`.
- Added the ability to remove Discord's forced minimum window size.
- Added a basic core updater to hopefully prevent the need for future installs.
- Added an option to log out all console logs to file for developers.
- Added an option to disable Discord's console warning.
- Added translations for the following languages: French, Slovak, Polish, Portuguese (BR), Chinese (Traditional), Chinese (Simplified)

### Removed
- Class normalizer was removed as it does more harm than good.

### Changed
- Addon error modals got a makeover thanks to [Strencher](https://github.com/Strencher) and [Tropical](https://github.com/Tropix126)
- Emotes are now downloaded as a single asar bundle as opposed to individual JSON files.
- Strings are now bundles with the main payload, but may move to a separate asar like the emotes.
- `BdApi` functions related to window preferences no longer work and are deprecated.
- Guild classes are obtained later from webpack in case it's not loaded in fast enough.
- DataStore now has additional protections (`try..catch`).

### Fixed
- Fixed an issue with old METAs used in themes cause the css to render invalid.
- Fixed crashing issues with plugins using `Buffer`.
- Fixed a bug for manual and 3rd party installations that don't create the BD folder.
- Fixed incorrect path usage for some Mac devices.
- Fixed colored text not doing anything.
- Fixed detached css window not loading saved css.
- Fixed an issue where toggling settings collections would remove incorrect panels.
- Fixed the file watchers not properly matching duplicate files.
- Fixed Hide GIF and Hide Gift options for Discord's changes
- Fixed public servers button not showing.
- Fixed multiple error modals showing on startup if multiple plugins had errors.
- Fixed incorrect styling on emotes.
- Fixed system editor edit buttons using an old Electron API (`openItem` vs `openPath`)
- Fixed an issue for those using exclusively server folders


## 1.0.0

### Added
- **Everything** is entirely rewritten, for better or worse.
- **Emotes and Custom CSS** can be completely turned off for those not interested. It saves on memory too by not loading those components.
- **Floating editors** for both custom css and plugins/themes are now available.
- **Monaco** is now used as the main CSS editor, in place of Ace.
- **Settings panels** are completely new and sleek. They are also highly extensible for potential future features :eyes:
- **Translations** are now integrated starting with only a couple languages, but feel free to contribute your own!
- **Public servers** got a new makeover thanks to some design help from Tropical and Gibbu!
We added settings to hide the **Gif Picker** and the **Nitro Gift** buttons in the textarea.

### Changed
- **Patcher API** was added to `BdApi` under `BdApi.Patcher`. The old `BdApi.monkeyPatch` was patched to use the Patcher as well. This allows plugins and patches to play nice with one another.
- **jQuery** was removed from dependencies.
- **General performance** improvements throughout the app, from startup to emotes to addons.
- **Exporting** by plugins is now highly encouraged over trying to match your meta name and class name.
- **Plugins and Themes** pages have more options for sorting, views and more. The entire panel got a facelift!
- **Blankslates** have been added all over for that added UX.
- **Several unused UI features** have been removed for a more performant and usable experience.
- **Debugger Hotkey** is now a built-in feature!

### Fixed
- **Minimal mode** has been redesigned from the ground up and now works as intended.
- **Emote menus** are fixed and now use React Patching to properly integrate into the new Emoji Picker. (Thanks Strencher#1044!)
