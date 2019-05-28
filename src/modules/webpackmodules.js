/**
 * Allows for grabbing and searching through Discord's webpacked modules.
 * @module WebpackModules
 * @version 0.0.2
 */

import Utilities from "./utilities";

const KnownModules = Utilities.memoizeObject({
    get React() {return WebpackModules.getByProps("createElement", "cloneElement");},
    get ReactDOM() {return WebpackModules.getByProps("render", "findDOMNode");},
    get Events() {return WebpackModules.getByPrototypes("setMaxListeners", "emit");},

    /* Guild Info, Stores, and Utilities */
    get GuildStore() {return WebpackModules.getByProps("getGuild");},
    get SortedGuildStore() {return WebpackModules.getByProps("getSortedGuilds");},
    get SelectedGuildStore() {return WebpackModules.getByProps("getLastSelectedGuildId");},
    get GuildSync() {return WebpackModules.getByProps("getSyncedGuilds");},
    get GuildInfo() {return WebpackModules.getByProps("getAcronym");},
    get GuildChannelsStore() {return WebpackModules.getByProps("getChannels", "getDefaultChannel");},
    get GuildMemberStore() {return WebpackModules.getByProps("getMember");},
    get MemberCountStore() {return WebpackModules.getByProps("getMemberCounts");},
    get GuildEmojiStore() {return WebpackModules.getByProps("getEmojis");},
    get GuildActions() {return WebpackModules.getByProps("markGuildAsRead");},
    get GuildPermissions() {return WebpackModules.getByProps("getGuildPermissions");},

    /* Channel Store & Actions */
    get ChannelStore() {return WebpackModules.getByProps("getChannels", "getDMFromUserId");},
    get SelectedChannelStore() {return WebpackModules.getByProps("getLastSelectedChannelId");},
    get ChannelActions() {return WebpackModules.getByProps("selectChannel");},
    get PrivateChannelActions() {return WebpackModules.getByProps("openPrivateChannel");},
    get ChannelSelector() {return WebpackModules.getByProps("selectGuild", "selectChannel");},

    /* Current User Info, State and Settings */
    get UserInfoStore() {return WebpackModules.getByProps("getToken");},
    get UserSettingsStore() {return WebpackModules.getByProps("guildPositions");},
    get AccountManager() {return WebpackModules.getByProps("register", "login");},
    get UserSettingsUpdater() {return WebpackModules.getByProps("updateRemoteSettings");},
    get OnlineWatcher() {return WebpackModules.getByProps("isOnline");},
    get CurrentUserIdle() {return WebpackModules.getByProps("getIdleTime");},
    get RelationshipStore() {return WebpackModules.getByProps("isBlocked", "getFriendIDs");},
    get RelationshipManager() {return WebpackModules.getByProps("addRelationship");},
    get MentionStore() {return WebpackModules.getByProps("getMentions");},

    /* User Stores and Utils */
    get UserStore() {return WebpackModules.getByProps("getCurrentUser");},
    get UserStatusStore() {return WebpackModules.getByProps("getStatus", "getState");},
    get UserTypingStore() {return WebpackModules.getByProps("isTyping");},
    get UserActivityStore() {return WebpackModules.getByProps("getActivity");},
    get UserNameResolver() {return WebpackModules.getByProps("getName");},
    get UserNoteStore() {return WebpackModules.getByProps("getNote");},
    get UserNoteActions() {return WebpackModules.getByProps("updateNote");},

    /* Emoji Store and Utils */
    get EmojiInfo() {return WebpackModules.getByProps("isEmojiDisabled");},
    get EmojiUtils() {return WebpackModules.getByProps("getGuildEmoji");},
    get EmojiStore() {return WebpackModules.getByProps("getByCategory", "EMOJI_NAME_RE");},

    /* Invite Store and Utils */
    get InviteStore() {return WebpackModules.getByProps("getInvites");},
    get InviteResolver() {return WebpackModules.getByProps("findInvite");},
    get InviteActions() {return WebpackModules.getByProps("acceptInvite");},

    /* Discord Objects & Utils */
    get DiscordConstants() {return WebpackModules.getByProps("Permissions", "ActivityTypes", "StatusTypes");},
    get DiscordPermissions() {return WebpackModules.getByProps("Permissions", "ActivityTypes", "StatusTypes").Permissions;},
    get Permissions() {return WebpackModules.getByProps("getHighestRole");},
    get ColorConverter() {return WebpackModules.getByProps("hex2int");},
    get ColorShader() {return WebpackModules.getByProps("darken");},
    get TinyColor() {return WebpackModules.getByPrototypes("toRgb");},
    get ClassResolver() {return WebpackModules.getByProps("getClass");},
    get ButtonData() {return WebpackModules.getByProps("ButtonSizes");},
    get IconNames() {return WebpackModules.getByProps("IconNames");},
    get NavigationUtils() {return WebpackModules.getByProps("transitionTo", "replaceWith", "getHistory");},

    /* Discord Messages */
    get MessageStore() {return WebpackModules.getByProps("getMessages");},
    get MessageActions() {return WebpackModules.getByProps("jumpToMessage", "_sendMessage");},
    get MessageQueue() {return WebpackModules.getByProps("enqueue");},
    get MessageParser() {return WebpackModules.getByProps("createMessage", "parse", "unparse");},

    /* In-Game Overlay */
    get OverlayUserPopoutSettings() {return WebpackModules.getByProps("openUserPopout");},
    get OverlayUserPopoutInfo() {return WebpackModules.getByProps("getOpenedUserPopout");},

    /* Experiments */
    get ExperimentStore() {return WebpackModules.getByProps("getExperimentOverrides");},
    get ExperimentsManager() {return WebpackModules.getByProps("isDeveloper");},
    get CurrentExperiment() {return WebpackModules.getByProps("getExperimentId");},

    /* Images, Avatars and Utils */
    get ImageResolver() {return WebpackModules.getByProps("getUserAvatarURL", "getGuildIconURL");},
    get ImageUtils() {return WebpackModules.getByProps("getSizedImageSrc");},
    get AvatarDefaults() {return WebpackModules.getByProps("getUserAvatarURL", "DEFAULT_AVATARS");},

    /* Drag & Drop */
    get DNDActions() {return WebpackModules.getByProps("beginDrag");},
    get DNDSources() {return WebpackModules.getByProps("addTarget");},
    get DNDObjects() {return WebpackModules.getByProps("DragSource");},

    /* Electron & Other Internals with Utils*/
    get ElectronModule() {return WebpackModules.getByProps("setBadge");},
    get Dispatcher() {return WebpackModules.getByProps("dirtyDispatch");},
    get PathUtils() {return WebpackModules.getByProps("hasBasename");},
    get NotificationModule() {return WebpackModules.getByProps("showNotification");},
    get RouterModule() {return WebpackModules.getByProps("Router");},
    get APIModule() {return WebpackModules.getByProps("getAPIBaseURL");},
    get AnalyticEvents() {return WebpackModules.getByProps("AnalyticEventConfigs");},
    get KeyGenerator() {return WebpackModules.getByRegex(/"binary"/);},
    get Buffers() {return WebpackModules.getByProps("Buffer", "kMaxLength");},
    get DeviceStore() {return WebpackModules.getByProps("getDevices");},
    get SoftwareInfo() {return WebpackModules.getByProps("os");},
    get CurrentContext() {return WebpackModules.getByProps("setTagsContext");},

    /* Media Stuff (Audio/Video) */
    get MediaDeviceInfo() {return WebpackModules.getByProps("Codecs", "SUPPORTED_BROWSERS");},
    get MediaInfo() {return WebpackModules.getByProps("getOutputVolume");},
    get MediaEngineInfo() {return WebpackModules.getByProps("MediaEngineFeatures");},
    get VoiceInfo() {return WebpackModules.getByProps("EchoCancellation");},
    get VideoStream() {return WebpackModules.getByProps("getVideoStream");},
    get SoundModule() {return WebpackModules.getByProps("playSound");},

    /* Window, DOM, HTML */
    get WindowInfo() {return WebpackModules.getByProps("isFocused", "windowSize");},
    get TagInfo() {return WebpackModules.getByProps("VALID_TAG_NAMES");},
    get DOMInfo() {return WebpackModules.getByProps("canUseDOM");},

    /* Locale/Location and Time */
    get LocaleManager() {return WebpackModules.getByProps("setLocale");},
    get Moment() {return WebpackModules.getByProps("parseZone");},
    get LocationManager() {return WebpackModules.getByProps("createLocation");},
    get Timestamps() {return WebpackModules.getByProps("fromTimestamp");},

    /* Strings and Utils */
    get Strings() {return WebpackModules.getByProps("Messages").Messages;},
    get StringFormats() {return WebpackModules.getByProps("a", "z");},
    get StringUtils() {return WebpackModules.getByProps("toASCII");},

    /* URLs and Utils */
    get URLParser() {return WebpackModules.getByProps("Url", "parse");},
    get ExtraURLs() {return WebpackModules.getByProps("getArticleURL");},

    /* Text Processing */
    get hljs() {return WebpackModules.getByProps("highlight", "highlightBlock");},
    get SimpleMarkdown() {return WebpackModules.getByProps("parseBlock", "parseInline", "defaultOutput");},

    /* DOM/React Components */
    /* ==================== */
    get LayerManager() {return WebpackModules.getByProps("popLayer", "pushLayer");},
    get Tooltips() {return WebpackModules.find(m => m.hide && m.show && !m.search && !m.submit && !m.search && !m.activateRagingDemon && !m.dismiss);},
    get UserSettingsWindow() {return WebpackModules.getByProps("open", "updateAccount");},
    get ChannelSettingsWindow() {return WebpackModules.getByProps("open", "updateChannel");},
    get GuildSettingsWindow() {return WebpackModules.getByProps("open", "updateGuild");},

    /* Modals */
    get ModalStack() {return WebpackModules.getByProps("push", "update", "pop", "popWithKey");},
    get UserProfileModals() {return WebpackModules.getByProps("fetchMutualFriends", "setSection");},
    get AlertModal() {return WebpackModules.getByPrototypes("handleCancel", "handleSubmit", "handleMinorConfirm");},
    get ConfirmationModal() {return WebpackModules.getModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");},
    get UserProfileModal() {
        return WebpackModules.find(m => {
            try {return m.modalConfig && m.prototype.render().type.displayName == "FluxContainer(Component)";}
            catch (err) {return false;}
        });
    },
    get ChangeNicknameModal() {return WebpackModules.getByProps("open", "changeNickname");},
    get CreateChannelModal() {return WebpackModules.getByProps("open", "createChannel");},
    get PruneMembersModal() {return WebpackModules.getByProps("open", "prune");},
    get NotificationSettingsModal() {return WebpackModules.getByProps("open", "updateNotificationSettings");},
    get PrivacySettingsModal() {return WebpackModules.getByRegex(/PRIVACY_SETTINGS_MODAL_OPEN/, m => m.open);},
    get CreateInviteModal() {return WebpackModules.getByProps("open", "createInvite");},
    get Changelog() {return WebpackModules.getModule((m => m.defaultProps && m.defaultProps.selectable == false));},
    get Avatar() {
        return WebpackModules.find(m => {
            if (m.displayName != "FluxContainer(t)") return false;
            try {
                const temp = new m();
                return temp && temp.state && temp.state.hasOwnProperty("isFocused");
            }
            catch (err) {return false;}
        });
    },

    /* Popouts */
    get PopoutStack() {return WebpackModules.getByProps("open", "close", "closeAll");},
    get PopoutOpener() {return WebpackModules.getByProps("openPopout");},
    get EmojiPicker() {return WebpackModules.getByDisplayName("FluxContainer(EmojiPicker)");},
    get UserPopout() {
        return WebpackModules.find(m => {
            try {return m.displayName == "FluxContainer(Component)" && !(new m());}
            catch (e) {return e.toString().includes("user");}
        });
    },

    /* Context Menus */
    get ContextMenuActions() {return WebpackModules.getByProps("openContextMenu");},
    get ContextMenuItemsGroup() {return WebpackModules.getByRegex(/itemGroup/);},
    get ContextMenuItem() {return WebpackModules.getByRegex(/\.label\b.*\.hint\b.*\.action\b/);},

    /* Misc */
    get ExternalLink() {return WebpackModules.getByRegex(/trusted/);},
    get TextElement() {return WebpackModules.getByProps("Sizes", "Weights");},
    get FlexChild() {return WebpackModules.getByProps("Child");},
    get Titles() {return WebpackModules.getByProps("Tags", "default");},

    /* Settings */
    get SettingsWrapper() {return WebpackModules.getModule(m => m.prototype && m.prototype.render && m.prototype.render.toString().includes("required:"));},
    get SettingsNote() {return WebpackModules.getModule(m => m.Types && m.defaultProps);},
    get SettingsDivider() {return WebpackModules.getModule(m => !m.defaultProps && m.prototype && m.prototype.render && m.prototype.render.toString().includes("default.divider"));},

    get ColorPicker() {return WebpackModules.getByPrototypes("renderCustomColorPopout");},
    get Dropdown() {return WebpackModules.getModule(m => m.prototype && !m.prototype.handleClick && m.prototype.render && m.prototype.render.toString().includes("default.select"));},
    get Keybind() {return WebpackModules.getByPrototypes("handleComboChange");},
    get RadioGroup() {return WebpackModules.getModule(m => m.defaultProps && m.defaultProps.options && m.defaultProps.size);},
    get Slider() {return WebpackModules.getByPrototypes("renderMark");},
    get SwitchRow() {return WebpackModules.getModule(m => m.defaultProps && m.defaultProps.hideBorder == false);},
    get Textbox() {return WebpackModules.getModule(m => m.defaultProps && m.defaultProps.type == "text");},
});

export {KnownModules};


 /**
 * Checks if a given module matches a set of parameters.
 * @callback module:WebpackModules.Filters~filter
 * @param {*} module - module to check
 * @returns {boolean} - True if the module matches the filter, false otherwise
 */

/**
 * Filters for use with {@link module:WebpackModules} but may prove useful elsewhere.
 */
export class Filters {
    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
     * @param {Array<string>} props - Array of property names
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byProperties(props, filter = m => m) {
        return module => {
            const component = filter(module);
            if (!component) return false;
            return props.every(property => component[property] !== undefined);
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties on the object's prototype.
     * @param {Array<string>} fields - Array of property names
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties on the object's prototype
     */
    static byPrototypeFields(fields, filter = m => m) {
        return module => {
            const component = filter(module);
            if (!component) return false;
            if (!component.prototype) return false;
            return fields.every(field => component.prototype[field] !== undefined);
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a regex.
     * @param {RegExp} search - A RegExp to check on the module
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byCode(search, filter = m => m) {
        return module => {
            const method = filter(module);
            if (!method) return false;
            return method.toString([]).search(search) !== -1;
        };
    }

    /**
     * Generates a {@link module:WebpackModules.Filters~filter} that filters by a set of properties.
     * @param {string} name - Name the module should have
     * @param {module:WebpackModules.Filters~filter} filter - Additional filter
     * @returns {module:WebpackModules.Filters~filter} - A filter that checks for a set of properties
     */
    static byDisplayName(name) {
        return module => {
            return module && module.displayName === name;
        };
    }

    /**
     * Generates a combined {@link module:WebpackModules.Filters~filter} from a list of filters.
     * @param {...module:WebpackModules.Filters~filter} filters - A list of filters
     * @returns {module:WebpackModules.Filters~filter} - Combinatory filter of all arguments
     */
    static combine(...filters) {
        return module => {
            return filters.every(filter => filter(module));
        };
    }
}

export default class WebpackModules {

    static find(filter, first = true) {return this.getModule(filter, first);}
    static findByUniqueProperties(props, first = true) {return first ? this.getByProps(...props) : this.getAllByProps(...props);}
    static findByDisplayName(name) {return this.getByDisplayName(name);}

    /**
     * Finds a module using a filter function.
     * @param {Function} filter A function to use to filter modules
     * @param {Boolean} first Whether to return only the first matching module
     * @return {Any}
     */
    static getModule(filter, first = true) {
        const modules = this.getAllModules();
        const rm = [];
        for (let index in modules) {
            if (!modules.hasOwnProperty(index)) continue;
            const module = modules[index];
            const {exports} = module;
            let foundModule = null;

            if (!exports) continue;
            if (exports.__esModule && exports.default && filter(exports.default)) foundModule = exports.default;
            if (filter(exports)) foundModule = exports;
            if (!foundModule) continue;
            if (first) return foundModule;
            rm.push(foundModule);
        }
        return first || rm.length == 0 ? undefined : rm;
    }

    /**
     * Finds a module by its display name.
     * @param {String} name The display name of the module
     * @return {Any}
     */
    static getByDisplayName(name) {
        return this.getModule(Filters.byDisplayName(name), true);
    }

    /**
     * Finds a module using its code.
     * @param {RegEx} regex A regular expression to use to filter modules
     * @param {Boolean} first Whether to return the only the first matching module
     * @return {Any}
     */
    static getByRegex(regex, first = true) {
        return this.getModule(Filters.byCode(regex), first);
    }

    /**
     * Finds a single module using properties on its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any}
     */
    static getByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), true);
    }

    /**
     * Finds all modules with a set of properties of its prototype.
     * @param {...string} prototypes Properties to use to filter modules
     * @return {Any}
     */
    static getAllByPrototypes(...prototypes) {
        return this.getModule(Filters.byPrototypeFields(prototypes), false);
    }

    /**
     * Finds a single module using its own properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    static getByProps(...props) {
        return this.getModule(Filters.byProperties(props), true);
    }

    /**
     * Finds all modules with a set of properties.
     * @param {...string} props Properties to use to filter modules
     * @return {Any}
     */
    static getAllByProps(...props) {
        return this.getModule(Filters.byProperties(props), false);
    }

    /**
     * Discord's __webpack_require__ function.
     */
    static get require() {
        if (this._require) return this._require;
        const id = "zl-webpackmodules";
        const __webpack_require__ = typeof(window.webpackJsonp) == "function" ? window.webpackJsonp([], {
            [id]: (module, exports, __webpack_require__) => exports.default = __webpack_require__
        }, [id]).default : window.webpackJsonp.push([[], {
            [id]: (module, exports, __webpack_require__) => module.exports = __webpack_require__
        }, [[id]]]);
        delete __webpack_require__.m[id];
        delete __webpack_require__.c[id];
        return this._require = __webpack_require__;
    }

    /**
     * Returns all loaded modules.
     * @return {Array}
     */
    static getAllModules() {
        return this.require.c;
    }

}