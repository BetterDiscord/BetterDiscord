export default {
    Panels: {
        plugins: "Plugins",
        themes: "Themes",
        customcss: "Custom CSS"
    },
    Collections: {
        settings: {
            name: "Settings",
            general: {
                name: "General",
                emotes: {
                    name: "Emote System",
                    note: "Enables BD's emote system"
                },
                publicServers: {
                    name: "Public Servers",
                    note: "Display public servers button"
                },
                voiceDisconnect: {
                    name: "Voice Disconnect",
                    note: "Disconnect from voice server when closing Discord"
                },
                classNormalizer: {
                    name: "Normalize Classes",
                    note: "Adds stable classes to elements to help themes. (e.g. adds .da-channels to .channels-Ie2l6A)"
                },
                showToasts: {
                    name: "Show Toasts",
                    note: "Shows a small notification for important information"
                }
            },
            appearance: {
                name: "Appearance",
                voiceMode: {
                    name: "Voice Mode",
                    note: "Hides everything that isn't voice chat"
                },
                minimalMode: {
                    name: "Minimal Mode",
                    note: "Hide elements and reduce the size of elements"
                },
                twentyFourHour: {
                    name: "24-Hour Timestamps",
                    note: "Converts 12-hour timestamps to 24-hour format"
                },
                hideChannels: {
                    name: "Hide Channels",
                    note: "Hides channels when in minimal mode"
                },
                darkMode: {
                    name: "Dark Mode",
                    note: "Make certain elements dark by default"
                },
                coloredText: {
                    name: "Colored Text",
                    note: "Make text colour the same as role color"
                },
                gifpickerhider: {
                    name: "Hide Gift Picker",
                    note: "Hides the Gif picker button in the textarea"
                },
                nitroGiftPickerHider: {
                    name: "Hide NitroGift Picker",
                    note: "Hides the NitroGift button in the textarea"
                }
            },
            addons: {
                name: "Addon Manager",
                addonErrors: {
                    name: "Show Addon Errors",
                    note: "Shows a modal with plugin/theme errors"
                },
                autoScroll: {
                    name: "Scroll To Settings",
                    note: "Auto-scrolls to a plugin's settings when the button is clicked (only if out of view)"
                },
                autoReload: {
                    name: "Automatic Loading",
                    note: "Automatically loads, reloads, and unloads plugins and themes"
                },
                editAction: {
                    name: "Edit Action",
                    note: "Where plugins & themes appear when editing",
                    options: {
                        detached: "Detached Window",
                        system: "System Editor"
                    }
                }
            },
            customcss: {
                name: "Custom CSS",
                customcss: {
                    name: "Custom CSS",
                    note: "Enables the Custom CSS tab"
                },
                liveUpdate: {
                    name: "Live Update",
                    note: "Updates the css as you type"
                },
                startDetached: {
                    name: "Start Detached",
                    note: "Clicking the Custom CSS tab opens the editor in a separate window",
                },
                nativeOpen: {
                    name: "Open in Native Editor",
                    note: "Clicking the Custom CSS tab opens your custom css in your native editor"
                },
                openAction: {
                    name: "Editor Location",
                    note: "Where Custom CSS should open by default",
                    options: {
                        settings: "Settings Menu",
                        detached: "Detached Window",
                        system: "System Editor"
                    }
                }
            },
            developer: {
                name: "Developer Settings",
                debuggerHotkey: {
                    name: "Debugger Hotkey",
                    note: "Allows activating debugger when pressing F8"
                },
                copySelector: {
                    name: "Copy Selector",
                    note: "Adds a \"Copy Selector\" option to context menus when developer mode is active"
                },
                reactDevTools: {
                    name: "React Developer Tools",
                    note: "Injects your local installation of React Developer Tools into Discord"
                }
            },
            window: {
                name: "Window Preferences",
                transparency: {
                    name: "Enable Transparency",
                    note: "Enables the main window to be see-through (requires restart)"
                },
                frame: {
                    name: "Window Frame",
                    note: "Adds the native os window frame to the main window"
                }
            }
        },
        emotes: {
            name: "Emotes",
            general: {
                name: "General",
                download: {
                    name: "Download Emotes",
                    note: "Download emotes whenever they are out of date"
                },
                emoteMenu: {
                    name: "Emote Menu",
                    note: "Show Twitch/Favourite emotes in emote menu"
                },
                hideEmojiMenu: {
                    name: "Hide Emoji Menu",
                    note: "Hides Discord's emoji menu when using emote menu"
                },
                autoCaps: {
                    name: "Emote Autocapitalization",
                    note: "Autocapitalize emote commands"
                },
                showNames: {
                    name: "Show Names",
                    note: "Show emote names on hover"
                },
                modifiers: {
                    name: "Show Emote Modifiers",
                    note: "Enable emote mods (flip, spin, pulse, spin2, spin3, 1spin, 2spin, 3spin, tr, bl, br, shake, shake2, shake3, flap)"
                },
                animateOnHover: {
                    name: "Animate On Hover",
                    note: "Only animate the emote modifiers on hover"
                }
            },
            categories: {
                name: "Categories",
                twitchglobal: {
                    name: "Twitch Globals",
                    note: "Show Twitch global emotes"
                },
                twitchsubscriber: {
                    name: "Twitch Subscribers",
                    note: "Show Twitch subscriber emotes"
                },
                frankerfacez: {
                    name: "FrankerFaceZ",
                    note: "Show emotes from FFZ"
                },
                bttv: {
                    name: "BetterTTV",
                    note: "Show emotes from BTTV"
                }
            }
        }
    },
    Addons: {
        title: "{{name}} v{{version}} by {{author}}",
        openFolder: "Open {{type}} Folder",
        reload: "Reload",
        addonSettings: "Settings",
        website: "Website",
        source: "Source",
        invite: "Support Server",
        donate: "Donate",
        patreon: "Patreon",
        name: "Name",
        author: "Author",
        version: "Version",
        added: "Date Added",
        modified: "Date Modified",
        search: "Search {{type}}",
        editAddon: "Edit",
        deleteAddon: "Delete",
        confirmDelete: "Are you sure you want to delete {{name}}?",
        confirmationText: "You have unsaved changes to {{name}}. Closing this window will lose all those changes.",
        enabled: "{{name}} has been enabled.",
        disabled: "{{name}} has been disabled.",
        couldNotEnable: "{{name}} could not be enabled.",
        couldNotDisable: "{{name}} could not be disabled.",
        couldNotStart: "{{name}} could not be started.",
        couldNotStop: "{{name}} could not be stopped.",
        methodError: "{{method}} could not be fired.",
        unknownAuthor: "Unknown Author",
        noDescription: "Description not provided.",
        alreadyExists: "There is already a {{type}} with name {{name}}",
        alreadWatching: "Already watching  addons.",
        metaError: "META could not be parsed.",
        missingNameData: "META missing name data.",
        metaNotFound: "META was not found.",
        compileError: "Could not be compiled.",
        wasUnloaded: "{{name}} was unloaded."
    },
    CustomCSS: {
        confirmationText: "You have unsaved changes to your Custom CSS. Closing this window will lose all those changes.",
        update: "Update",
        save: "Save",
        openNative: "Open in System Editor",
        openDetached: "Detach Window",
        settings: "Editor Settings",
        editorTitle: "Custom CSS Editor"
    },
    Developer: {
        copySelector: "Copy Selector"
    },
    Emotes: {
        loading: "Loading emotes in the background do not reload.",
        loaded: "All emotes successfully loaded.",
        clearEmotes: "Clear Emote Data",
        favoriteAction: "Favorite!"
    },
    PublicServers: {
        button: "public",
        join: "Join",
        joining: "Joining",
        joined: "Joined",
        loading: "Loading",
        loadMore: "Load More",
        notConnected: "Not Connected",
        connectionRequired: "You must connect your account in order to join servers.",
        search: "Search",
        connect: "Connect",
        reconnect: "Reconnect",
        categories: "Categories",
        keywords: "Keywords",
        connection: "Connected as: {{username}}#{{discriminator}}",
        results: "Showing {{start}}-{{end}} of {{total}} results in {{category}}",
        query: "for {{query}}"
    },
    Modals: {
        confirmAction: "Are You Sure?",
        okay: "Okay",
        cancel: "Cancel",
        nevermind: "Nevermind",
        close: "Close",
        name: "Name",
        message: "Message",
        error: "Error",
        addonErrors: "Addon Errors",
        restartRequired: "Restart Required",
        restartNow: "Restart Now",
        restartLater: "Restart Later",
        additionalInfo: "Additional Info"
    },
    ReactDevTools: {
      notFound: "Extension Not Found",
      notFoundDetails: "Unable to find the React Developer Tools extension on your PC. Please install the extension on your local Chrome installation."  
    },
    Sorting: {
        sortBy: "Sort By",
        order: "Order",
        ascending: "Ascending",
        descending: "Descending"
    },
    Startup: {
        notSupported: "Not Supported",
        versionMismatch: "BetterDiscord Injector v{{injector}} is not supported by the latest remote (v{{remote}}).\n\nPlease download the latest version from [GitHub](https://github.com/rauenzi/BetterDiscordApp/releases/latest)",
        incompatibleApp: "BetterDiscord does not work with {{app}}. Please uninstall one of them.",
        updateNow: "Update Now",
        maybeLater: "Maybe Later",
        updateAvailable: "Update Available",
        updateInfo: "There is an update available for BetterDiscord's Injector ({{version}}).\n\nYou can either update and restart now, or later.",
        updateFailed: "Could Not Update",
        manualUpdate: "Unable to update automatically, please download the installer and reinstall normally.\n\n[Download Installer](https://github.com/rauenzi/BetterDiscordApp/releases/latest)",
        jqueryFailed: "jQuery Failed To Load",
        jqueryFailedDetails: "jQuery could not be loaded, and some plugins may not work properly. Proceed at your own risk."
    },
    WindowPrefs: {
        enabledInfo: "This option requires a transparent theme in order to work properly. On Windows this may break your aero snapping and maximizing.\n\nIn order to take effect, Discord needs to be restarted. Do you want to restart now?",
        disabledInfo: "In order to take effect, Discord needs to be restarted. Do you want to restart now?"
    }
};
