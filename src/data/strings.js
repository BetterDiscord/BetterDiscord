export default {
    en: {
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
                    twentyFourHour: {
                        name: "24-Hour Timestamps",
                        note: "Hides channels when in minimal mode"
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
                    developerMode: {
                        name: "Developer Mode",
                        note: "Allows activating debugger when pressing F8"
                    },
                    copySelector: {
                        name: "Copy Selector",
                        note: "Adds a \"Copy Selector\" option to context menus when developer mode is active"
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
            server: "Support Server",
            donate: "Donate",
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
        },
        Emotes: {
            loading: "Loading emotes in the background do not reload.",
            loaded: "All emotes successfully loaded.",
            clearEmotes: "Clear Emote Data",
            favoriteAction: "Favorite!"
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
        PublicServers: {
            button: "public",
            join: "Join",
            joining: "Joining",
            joined: "Joined",
            loading: "Loading",
            loadMore: "Load More",
            notConnected: "Not connected to DiscordServers.com!",
            search: "Search",
            connect: "Connect",
            reconnect: "Reconnect",
            categories: "Categories",
            connection: "Connected as: {{username}}#{{discriminator}}",
            results: "Showing {{start}}-{{end}} of {{total}} results in {{category}}",
            query: "for {{query}}"
        },
        Modals: {
            confirmAction: "Are You Sure?",
            okay: "Okay",
            cancel: "Cancel",
            close: "Close",
            name: "Name",
            message: "Message",
            error: "Error",
            addonErrors: "Addon Errors"
        },
        Sorting: {
            sortBy: "Sort By",
            order: "Order",
            ascending: "Ascending",
            descending: "Descending"
        }
    },
    pl: {
        Panels: {
            plugins: "Wtyczki",
            themes: "Motywy",
            customcss: "Niestandardowy CSS"
        },
        Collections: {
            settings: {
                name: "Ustawienia",
                general: {
                    name: "Ogólne",
                    emotes: {
                        name: "System emoji",
                        note: "Aktywuje system emoji BetterDiscorda"
                    },
                    publicServers: {
                        name: "Publiczne serwery",
                        note: "Wyświetla przycisk z publicznymi serwerami"
                    },
                    voiceDisconnect: {
                        name: "Rozłączanie z czatem głosowym",
                        note: "Rozłącza z czatem głosowym przy wyjściu z Discorda"
                    },
                    twentyFourHour: {
                        name: "24-godzinne znaczniki czasu",
                        note: "Zamienia 12-godzinne znaczniki czasu z 24-godzinnymi"
                    },
                    classNormalizer: {
                        name: "Normalne klasy",
                        note: "Dodaje normalne klasy dla elementów, aby ułatwić tworzenie motywów (np. dodaje .da-channels dla klasy .channels-Ie2l6A)"
                    },
                    showToasts: {
                        name: "Okienka z powiadomieniami",
                        note: "Wyświetla małe powiadomienia dla ważnych informacji"
                    }
                },
                appearance: {
                    name: "Wygląd",
                    voiceMode: {
                        name: "Tryb głosowy",
                        note: "Ukrywa wszystko, co nie jest czatem głosowym"
                    },
                    minimalMode: {
                        name: "Tryb kompaktowy",
                        note: "Ukrywa lub zmniejsza rozmiar elementów"
                    },
                    hideChannels: {
                        name: "Ukrywanie kanałów",
                        note: "Ukrywa kanały, gdy tryb kompaktowy jest włączony"
                    },
                    darkMode: {
                        name: "Tryb ciemny",
                        note: "Zmienia styl określonych elementów na ciemny"
                    },
                    coloredText: {
                        name: "Kolorowy tekst",
                        note: "Zmienia kolor tekstu użytkownika na kolor jego rangi"
                    }
                },
                addons: {
                    name: "Menedżer dodatków",
                    addonErrors: {
                        name: "Błędy dodatków",
                        note: "Wyświetla błędy wtyczek i motywów"
                    },
                    autoScroll: {
                        name: "Przewijanie do ustawień",
                        note: "Automatycznie przewija do ustawień wtyczki, jeżeli nie są one widoczne"
                    },
                    autoReload: {
                        name: "Automatyczne ładowanie",
                        note: "Automatycznie ładuje, odświeża i dezaktywuje wtyczki oraz motywy"
                    },
                    editAction: {
                        name: "Edytowanie wtyczek i motywów",
                        note: "Miejsce w którym otwierają się edytowane wtyczki i motywy",
                        options: {
                            detached: "Oddzielne okno",
                            system: "Edytor systemowy"
                        }
                    }
                },
                customcss: {
                    name: "Niestandardowy CSS",
                    customcss: {
                        name: "Niestandardowy CSS",
                        note: "Aktywuje zakładkę z niestandardowych kodem CSS"
                    },
                    liveUpdate: {
                        name: "Automatyczne aktualizacje",
                        note: "Aktualizuje kod CSS bezpośrednio po napisaniu"
                    },
                    startDetached: {
                        name: "Oddzielne okno",
                        note: "Kliknięcie w zakładkę z niestandardowym kodem CSS otworzy edytor w oddzielnym oknie",
                    },
                    nativeOpen: {
                        name: "Domyślny edytor",
                        note: "Kliknięcie w zakładkę z niestandardowym kodem CSS otworzy kod w twoim domyślnym edytorze"
                    },
                    openAction: {
                        name: "Lokalizacja edytora",
                        note: "Miejsce w którym domyślnie otwiera się niestandardowy kod CSS",
                        options: {
                            settings: "Ustawienia",
                            detached: "Oddzielne okno",
                            system: "Edytor systemowy"
                        }
                    }
                },
                developer: {
                    name: "Ustawienia dla programistów",
                    developerMode: {
                        name: "Tryb programisty",
                        note: "Umożliwia włączenie debuggera poprzez naciśnięcie F8"
                    },
                    copySelector: {
                        name: "Kopiowanie selektora",
                        note: "Dodaje opcję \"Kopiuj selektor\" do menu kontekstowego, jeżeli tryb programisty jest włączony"
                    }
                },
                window: {
                    name: "Ustawienia okna",
                    transparency: {
                        name: "Przezroczystość",
                        note: "Dodaje przezroczystość do głównego okna Discorda (wymaga zrestartowania)"
                    },
                    frame: {
                        name: "Obramowanie okna",
                        note: "Dodaje domyślne systemowe obramowanie okna dla Discorda"
                    }
                }
            },
            emotes: {
                name: "Emoji",
                general: {
                    name: "Ogólne",
                    download: {
                        name: "Pobieranie emoji",
                        note: "Pobiera nowe emoji, gdy obecne są przestarzałe"
                    },
                    emoteMenu: {
                        name: "Menu emoji",
                        note: "Wyświetla ulubione emoji oraz emoji z Twitcha w menu"
                    },
                    hideEmojiMenu: {
                        name: "Ukrywanie menu emoji",
                        note: "Ukrywa menu emoji Discorda podczas korzystania z menu emoji"
                    },
                    autoCaps: {
                        name: "Zmiana wielkości liter emoji",
                        note: "Automatycznie zmienia wielkość liter emoji na poprawne"
                    },
                    showNames: {
                        name: "Nazwy emoji",
                        note: "Wyświetla nazwę emoji po najechaniu na nią kursorem"
                    },
                    modifiers: {
                        name: "Modyfikacje emoji",
                        note: "Umożliwia modyfikowanie emoji (flip, spin, pulse, spin2, spin3, 1spin, 2spin, 3spin, tr, bl, br, shake, shake2, shake3, flap)"
                    },
                    animateOnHover: {
                        name: "Animacje po najechaniu",
                        note: "Wyświetla animacje tylko po najechaniu kursorem na zmodyifkowane emoji"
                    }
                },
                categories: {
                    name: "Kategorie",
                    twitchglobal: {
                        name: "Globalne emoji Twitcha",
                        note: "Wyświetla globalne emoji w Twitcha"
                    },
                    twitchsubscriber: {
                        name: "Emoji dla subskrybentów z Twitcha",
                        note: "Wyświetla emoji dla subskrybentów z Twitcha"
                    },
                    frankerfacez: {
                        name: "FrankerFaceZ",
                        note: "Wyświetla emoji z FFZ"
                    },
                    bttv: {
                        name: "BetterTTV",
                        note: "Wyświetla emoji z BTTV"
                    }
                }
            }
        },
        Addons: {
            title: "{{name}} (wersja {{version}}) autorstwa {{author}}",
            openFolder: "Otwórz folder: {{type}}",
            reload: "Odśwież",
            addonSettings: "Ustawienia",
            website: "Strona internetowa",
            source: "Źródło",
            server: "Wspomóż serwer",
            donate: "Wspomóż",
            name: "Nazwa",
            author: "Twórca",
            version: "Wersja",
            added: "Data dodania",
            modified: "Data modyfikacji",
            search: "Wyszukaj: {{type}}",
            editAddon: "Edytuj",
            deleteAddon: "Usuń",
            confirmDelete: "Czy na pewno chcesz usunąć wtyczkę {{name}}?",
            confirmationText: "Masz niezapisane zmiany dla {{name}}. Zamknięcie tego okna spowoduje utratę wszystkich zmian.",
        },
        Emotes: {
            loading: "Ładowanie emoji w tle - nie odświeżaj Discorda.",
            loaded: "Wszystkie emoji zostały pomyślnie załadowane.",
            clearEmotes: "Wyczyść dane emoji",
            favoriteAction: "Dodaj do ulubionych!"
        },
        CustomCSS: {
            confirmationText: "Masz niezapisane zmiany w swoim niestandardowym kodzie CSS. Zamknięcie tego okna spowoduje utratę wszystkich zmian.",
            update: "Aktualizuj",
            save: "Zapisz",
            openNative: "Otwórz w edytorze systemowym",
            openDetached: "Oddziel okno",
            settings: "Ustawienia edytora",
            editorTitle: "Edytor niestandardowego kodu CSS"
        },
        PublicServers: {
            button: "serwery",
            join: "Dołącz",
            joining: "Dołączanie",
            joined: "Dołączono",
            loading: "Ładowanie",
            loadMore: "Załaduj więcej",
            notConnected: "Brak połączenia z DiscordServers.com!",
            search: "Wyszukaj",
            connect: "Połącz",
            reconnect: "Połącz ponownie",
            categories: "Kategorie",
            connection: "Połączono jako: {{username}}#{{discriminator}}",
            results: "Wyświetlanie {{start}}-{{end}} z {{total}} wszystkich wyników w kategorii {{category}}",
            query: "dla {{query}}"
        },
        Modals: {
            confirmAction: "Czy na pewno chcesz to zrobić?",
            okay: "Tak",
            cancel: "Anuluj",
            close: "Zamknij",
            name: "Nazwa",
            message: "Wiadomość",
            error: "Błąd",
            addonErrors: "Błędy dodatków"
        },
        Sorting: {
            sortBy: "Sortuj wg",
            order: "Kolejność",
            ascending: "Rosnąco",
            descending: "Malejąco"
        }
    }
};
