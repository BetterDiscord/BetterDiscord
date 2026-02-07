# BetterDiscord Changelog

This changelog starts with the restructured 1.0.0 release that happened after context isolation changes. The changelogs here should more-or-less mirror the ones that get shown in the client but probably with less formatting and pizzazz.

1.13.7
### Added
- New Webpack cache system for faster loading times; you will see much faster loading times after the first launch with this update.

### Fixed
- Fixed `tags` button appearing behind other elements in the Addon Store
- Fixed downloading addons via the addon store
- Fixed dropdowns with lots of options not allowing you to scroll through all of the options
- Minor UI fixes

### Improvements
- Dropdowns now automatically scroll to the selected option when opened

1.13.6

### Fixed
- Fixed BetterDiscord not appearing in the `Settings Cog` context menu (right click menu)
- Fixed `Version Info` strings in settings not appearing
- Native titlebar matches Linux now

### Improvements
- Allow context menu toggle to be preventDefaulted
- ContextMenu API Rework
- Rewrite Native Fetch

1.13.5

### Added
- Added `data-speaking` attribute to VoiceUser in ThemeAttributes

### Fixed
- Fixed BdApi.Net.fetch not handling relative urls properly
- BetterDiscord now properly checks for addon updates periodically
- BetterDiscord now loads up correctly

### Improved
- Tweaked styles for InstallCSS
- BetterDiscord's Dropdown Component was rewrote

### Removed

1.13.4

### Fixed:
- Fixed styles breaking in certain areas.
- Fixed theme attributes from causing a bunch of lag.

1.13.3

### Fixed:
- BetterDiscord Settings section now appears correctly in the settings menu
- Fixed css to match Discord's latest changes
- Context Menu patches fixed

1.13.2

### Fixed:
- BetterDiscord Settings section now appears correctly in the settings menu
- Fixed css to match Discord's latest changes
- Context Menu patches fixed


1.13.1

### Fixed:
- Navigating to Plugins, Themes, or Settings from the context menu now correctly opens the intended page
- Custom CSS file is now automatically created if it doesn't exist
- aria-label for BetterDiscord section in settings panel now sets correctly
- Plugins/Themes Search bar clear button now properly resets the input field
- Fixed css to match Discord's latest changes
- BetterDiscord Settings section now appears correctly in the settings menu
- Fixes for theme attributes
- Flipped canary tooltip status fixed

## 1.13.0

### Added
- InstallCSS button next to CSS snippets for easy installation, with safety fallbacks like "Keep Changes", automatically reverting changes after 10 seconds if not kept
- In-App Notification API `BdApi.UI.showNotification`
- Ability to shift+click to open a plugin's settings from context menu
- Support for custom modal sizing to allow plugins to create modals with different dimensions and improved theming flexibility
- `aria-label` to buttons within the BD settings to improve screen reader compatibility and accessibility for users with disabilities
- React hook wrapper (`BdApi.ReactUtils.wrapInHooks`)
- Early groundwork for theme settings
- Recovery action for closing Discord modals
- `BdApi.Webpack.getBulk` for bulk getting all needed modules within one search
- `BdApi.Utils.forceLoad` to force lazy chunks to be loaded
- `BdApi.Webpack.Stores` added for easy access to all stores
- Added a changelog button to the layer modal settings

### Removed
- `Filters.byProps` removed
- `Filters.byPrototypeFields` removed
- All functions directly on `BdApi` have been removed

### Changed
- Repository reorganization, move from node/npm to bun, from webpack to esbuild, from mocha to bun:test, start TypeScript, and upgrade eslint
- Switched to using lucide icons
- Full transition to TypeScript
- Added our own react compatible stores and moved the addon manager and settings to a new model
- Added some useful defaults for VS Code
- Switched to text-based lockfile (chore)
- Revamped the i18n to support pluralization
- Updated module filtering to use `moduleCache[id]` instead of `webpackRequire.m[module.id]` for more reliable module string access
- Updated module resolution to handle Discord's new proxy-based i18n system by fixing export handling and store filtering
- Improved startup performance by replacing DataStore with lazy-loading JSON cache system
- Enhanced code editor with features including autocomplete, status bar, problems panel (VS Code-like), and improved Monaco Editor integration
- Moved update notices for BetterDiscord Core and Plugins & Themes away from Notices, to the new Notification API
- General freshen up of the CSS since Discord's large visual refresh
- Monaco editor is now lazy-loaded, improving startup performance
- Rewrote toasts to make them more in-line with NotificationApi logic & styling refresh
- Startup toasts now only show "XX Plugins/Themes enabled" rather than individual toasts for each plugin
- Changes the markdown for the betterdiscord:// protocol so it works in slate and masked links
- Hijack opening links to open the download modal on all bd addon download urls
- Visual changes to the react error recovery page to increase aesthetics.

### Fixed
- Context issue on BdApi.Webpack where `this.getModule` could return `not a function`
- Slash Command API conflicts
- getMangled utility function to properly handle undefined properties when mapping object keys
- ThemeAttributes builtin throwing errors when message components lack aria-roledescription property
- `clearable` option for `keybind` setting, if set to `true` it will now allow clearing a keybind
- Compatibility with newer Electron/Node.js versions by using stats.mtimeMs and adding OS check for accent color API
- BrowserWindow minimum size removal
- `Automatically Enable` tickbox not enabling the plugin if the file's name differed from the plugins store name
- Webpack module listening to include initial modules and optimized plugin lifecycle calls with better error handling
- Editor focus being lost in settings panel
- Issues with the BetterDiscord updater functionality and resolved problems with the getlazy utility
- Fixes a bug where if `pluginInstance.onSwitch` or `pluginInstance.observer` were non-nullable but not a function it would error
- Fixed `/[addon type] action:Enable name:[addon name]` from saying the addon started even if it errored
- Slight changes to `getByStrings` to increase webpack search speed
- Updated the context menu module for Discord's changes


## 1.12.8

### Added

### Removed

### Changed

### Fixed
 - Fixed for Discord modal changes


## 1.12.7

### Added

### Removed

### Changed
- Move settings patch to after user connection

### Fixed


## 1.12.6

### Added

### Removed

### Changed

### Fixed
 - Fixed theme attribute selectors
 - Fixed remove minimum size
 - Fixed bad css


## 1.12.5

### Added

### Removed

### Changed

### Fixed
 - Fixed more using old reactdom apis
 - Fixed webpack require hijack
 - Fixed customcss watcher


## 1.12.4

### Added

### Removed

### Changed

### Fixed
 - Fixed using old reactdom apis


## 1.12.3

### Added

### Removed

### Changed
 - Added a temporary delay to renderer injection in response to Discord changes

### Fixed


## 1.12.2

### Added

### Removed

### Changed

### Fixed
 - Fixed pasting in monaco
 - Fixed command auth
 - Fixed toast location
 - Fixed notice location
 - Fixed mtime usages


## 1.12.1

### Added
 - Sliders can now set more specific labels in their markers
 - Addon update checking can now be toggled
 - Update checking can now be done periodically

### Removed
- Removed extra code in the devtools warning module

### Changed
 - `forceUpdate` is only used for particular setting IDs
 - `bySource` now accepted multiple searches
 - Store and addon requests now set the no-cache directive

### Fixed
 - Fixed frame showing up on linux
 - Fixed opening store from context menu
 - Fixed addon store error causing freezes
 - Fixed crashing when mentioning a bot
 - Fixed addon updates not checking status code


## 1.12.0

### Added
 - Added built-in addon store
 - Slash command API
 - Default BetterDiscord slash commands
 - Search webpack modules by source code string (or regex) search (`getBySource`)
 - Basic theme attributes
 - React crash recovery
 - API for mapping the mangled keys of a single module (`getMangled`)
 - Webpack search APIs now have a `raw` option to return the entire `Module` object
 - New native window frame option
 - In-app traffic lights for macOS when using a native frame
 - Added `onAdded` to the plugin api under `DOM`
 - New `Open Addon Store` entry in context menu

### Removed

### Changed
 - `DOM.createElement` can now accept multiple children and any number of directly assignable properties
 - Settings builder now accepts a `button` type
 - Addon error modal now uses `details` and `summary` to be more accessible
 - Internal setting strings are now handled via `get` functions to allow for blind auto-translations
 - `className` function changed to use `clsx` under the hood--our first true dependency
 - Webpack searching does some additional sanity checking to help prevent errors on string searches
   - String searches are becoming more and more common so this will help performance on those searches
   - The downside is this has some very slight overhead for all other types of searching

### Fixed
 - Fixed remove minimum size
 - Clicking component source in react devtoools now goes to the right component when patched
 - Corrupt plugin configs won't halt operation
 - Blankslate for no addons in the list now render properly
 - Fixed grabbing context menu components
 - Fixed grabbing modal actions

### Deprecated
 - `target` option of `DOM.createElement` is deprecated

## 1.11.0

### Added
 - Added new `showChangelogModal` to the `UI` namespace
 - Added `getNestedValue` and `semverCompare` to `Utils`
 - Added settings builders to `UI` namespace as `buildSettingItem` and `buildSettingsPanel`
 - Added a `Logger` namespace for easier and prettier logging of debug information
 - Added some React components under `BdApi.Components

### Removed

### Changed

### Fixed
 - Fixed a `0` showing up when modals weren't on screen
 - Fixed the version string not showing up in settings
 - Fixed an issue where enabled/disabling custom css wouldn't update the style
 - Fixed tooltips not being able to have custom labels
 - Fixed lazy `Webpack` listeners not being given the correct arguments
 - Fixed `Filters.combine` not using the correct arguments
 - Fixed plugin settings modals overflowing the window

## 1.10.2

### Added

### Removed

### Changed

### Fixed
- Fixed transition group search for Discord's new export schema

## 1.10.1

### Added
- Added an `ErrorBoundary` to the custom modal stack to prevent errors from bubbling up and preventing startup.

### Removed

### Changed

### Fixed
- Fixed modal transition component search for Discord's new function component version


## 1.10.0

### Added
- Enable/disable all buttons for both AddonLists
- BDContextMenu has been integrated
- Ability to reset to default settings of any collection
- Several design components like Flex, Button, Text, and all Modal components
- Added a backup modal stack and backdrop in case we lose Discord's again
- Added a wanring for large debug logs
- `onClose` for modal APIs
- New debug information in user settings

### Removed
- Several unused "known modules"
- `DiscordClasses` module since it was seldom used
- `ClassName` and similar constructs
- Legacy emote assets

### Changed
- Search bars now auto focus
- Opening folder on Windows now occur in the foreground
- Search fields are now clearable
- AddonList pages now show totals and results of searches
- Custom CSS live update is now debounced and using a proper switch not a checkbox
- ConfirmationModal and ChangelogModal are now using custom components
- Updater panel now uses icons rather than text buttons
- AddonList panels have been rearranged to accomodate the new buttons
- The anonymous BD patch function is now named `BDPatcher`
- Modal APIs now use internal ConfirmationModal component
- Markdown areas now consistenly allow for embedded links
- Lazy loaded modules are returned to the original source

### Fixed
- Fixed grabbing the wrong module for accepting invites
- Fixed more strings that were not translatable

## 1.9.8

### Added

### Removed

### Changed

### Fixed
- Removed `ipc.sendTo` for electron 28
- Fixed core updater not using the semver comparator

## 1.9.7

### Added
- Support for Spanish (LATAM) locale

### Removed

### Changed
- Updated translations
- Ignore relative requires (This is because when favoriting a GIF and other UI actions, Discord repeatedly attempts to load relative requires on accident causing our code to make tons of FS requests causing lag.)

### Fixed
- Fixed locale not falling back to English properly

## 1.9.6

### Added
- All HTTP request options for bd-fetch

### Removed

### Changed
- Updated translations

### Fixed
- Fixed race conditions for notices
- Fixed options not being sent to fetch

## 1.9.5

### Added

### Removed

### Changed

### Fixed
- Fixed the webpack patch for the new loader

## 1.9.4

### Added
- New css variable `--os-accent-color`
- Temporary `Buffer` polyfill

### Removed

### Changed
- `BdApi.Net.fetch` now has an optional `timeout` parameter

### Fixed
- Fixes not being able to use `http` for `BdApi.Net.fetch`.
- Bad URLs and other early errors in `BdApi.Net.fetch` now handled better.

## 1.9.3

### Added
- Multiple shorthand functions under `BdApi.Webpack`
- New `getStore` filter

### Removed

### Changed
- Updated translations

### Fixed
- Fixed header color in light mode.
- Fixed window size retention for users of remove minimum size option.
- Fixed a toast saying an addon was loaded when it was unloaded.
- Fixed context menu patching API for plugins.

## 1.9.2

### Added

### Removed

### Changed

### Fixed
- Fixed context menu crash & api

## 1.9.1

### Added
- SourceURL for the renderer

### Removed

### Changed

### Fixed
- Fixed client crashes

## 1.9.0

### Added
- Remove minimum window size now remembers desired size
- Basic semver comparison

### Removed
- Public Servers
- Old DataStore functions that are no longer used

### Changed
- All main react components are now functional with hooks
- Mac now uses cmd instead of ctrl

### Fixed
- Fixed dropdowns
- Fixed markdown parser

## 1.8.5

### Added
- Ability to use a custom local version of React DevTools
- Experimental `BdApi.Components` for component access in plugins

### Removed

### Changed
- Title for settings sidebar now uses a custom component

### Fixed
- Fixed ModalRoot and ConfirmationModal not being found in webpack
- Fixed context menus for internal changes

## 1.8.4

### Added

### Removed

### Changed

### Fixed
- Fixed more bugs with context menu api

## 1.8.3

### Added
- Checking for old installs and deleting them

### Removed
- All references to Emotes, this will become a separate plugin

### Changed
- Moved to the more permissive Apache 2.0 license
- Now check for discord.asar for electron17+
- Handle setting module exports internally rather than maintaining getter references

### Fixed
- Fixed `inject` for electron17+
- Updater checking `>` which does not work for open versions
- Fixed a startup bug with the context menu api

## 1.8.2

### Added

### Removed

### Changed

### Fixed
- Fixed modals not working
- Fixed downloading binary files
- Fixed public server invites

## 1.8.1

### Added
- A script to automatically grab the new translations from POEditor
- Several new translations

### Removed

### Changed
- Moved some hardcoded strings to be part of the translation system
- Several updated translations

### Fixed
- Fixed context menu patcher not patching consistently
- Fixed context menu toggle item UI not updating
- Fixed an issue with the bound API checking the wrong arguments
- Fixed `getOwnerInstance` calling the wrong functions internally

## 1.8.0

### Added
- Proper updater system with UI.
- Tooltip component for plugins.
- Highly expanded plugin API.

### Removed

### Changed
- Reverted how internal webpack module searches are performed.
- New options for webpack searches.

### Fixed
- Fixed many issues regarding memory leaks and out-of-memory errors!
- Fixed a major issue where webpack searches would iterate by default.
- Fixed an issue with `byStrings` and `combine` filters in the API.
- Fixed an issue where searching for multiple modules could yield the same module multiple times.
- Fixed an issue where misnamed addon files could prevent startup.
- Fixed an issue where the `request` module would not follow redirects.
- Fixed an issue where certain modals could crash the client.
- Fixed an issue where toasts would not show on the crash screen.

## 1.7.0

### Added
- Polyfill for certain node modules.

### Removed
- Proxy protection for certain modules.

### Changed
- Changed how internal webpack module searches are performed.
- New location for public servers button.
- Switch to pnpm with workspaces.
- Improved startup errors.

### Fixed
- Fixed several issues for Discord's internal changes.

## 1.6.3

### Added

### Removed

### Changed
- Plugin startup errors should be more descriptive for developers.

### Fixed
- Fixed an issue where custom css crashed Discord.
- Fixed an issue where `waitForModule` returned a boolean instead of a module.

## 1.6.2

### Added

### Removed

### Changed

### Fixed
- Fixed non-loading issue due to changed UserSettingsStore

## 1.6.1

### Added

### Removed

### Changed

### Fixed
- Fixed an issue where `waitForModule` would not return the found module.
- Fixed an issue where broken addon METAs could prevent BD from fully loading.
- Fixed an issue where developer badges stopped rendering.

## 1.6.0

### Added
- Better handling and fallback when the editor fails to load. (Thanks Qb)
- Now able to sort addons by whether they're enabled. (Thanks TheGreenPig)
- New `Webpack` API added for plugin developers to take advantage of.

### Removed

### Changed
- Addon loading no longer uses `require`
- Addon error modal updated (Thanks Qb)
- Fixed plugin error display on the modal

### Fixed
- Fixed dispatcher changes by Discord

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
