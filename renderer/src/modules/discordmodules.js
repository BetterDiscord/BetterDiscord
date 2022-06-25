/**
 * A large list of known and useful webpack modules internal to Discord.
 *
 * @module DiscordModules
 * @version 0.0.3
 */

import Utilities from "./utilities";
import WebpackModules from "./webpackmodules";

export default Utilities.memoizeObject({
    get React() {return WebpackModules.getByProps("createElement", "cloneElement");},
    get ReactDOM() {return WebpackModules.getByProps("render", "findDOMNode");},
    get Flux() {return WebpackModules.getByProps("connectStores");},
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
    get ChannelStore() {return WebpackModules.getByProps("getChannel", "getDMFromUserId");},
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
    get PermissionUtils() {return WebpackModules.getByProps("getHighestRole");},
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

    /* Text Processing */
    get hljs() {return WebpackModules.getByProps("highlight", "highlightBlock");},
    get SimpleMarkdown() {return WebpackModules.getByProps("parseBlock", "parseInline", "defaultOutput");},

    /* Experiments */
    get ExperimentStore() {return WebpackModules.getByProps("getExperimentOverrides");},
    get ExperimentsManager() {return WebpackModules.getByProps("isDeveloper");},
    get CurrentExperiment() {return WebpackModules.getByProps("getExperimentId");},

    /* Images, Avatars and Utils */
    get ImageResolver() {return WebpackModules.getByProps("getUserAvatarURL", "getGuildIconURL");},
    get ImageUtils() {return WebpackModules.getByProps("getSizedImageSrc");},
    get AvatarDefaults() {return WebpackModules.getByProps("getUserAvatarURL", "DEFAULT_AVATARS");},

    /* Window, DOM, HTML */
    get WindowInfo() {return WebpackModules.getByProps("isFocused", "windowSize");},
    get TagInfo() {return WebpackModules.getByProps("VALID_TAG_NAMES");},
    get DOMInfo() {return WebpackModules.getByProps("canUseDOM");},

    /* Locale/Location and Time */
    get LocaleManager() {return WebpackModules.getByProps("setLocale");},
    get Moment() {return WebpackModules.getByProps("parseZone");},
    get LocationManager() {return WebpackModules.getByProps("createLocation");},
    get Timestamps() {return WebpackModules.getByProps("fromTimestamp");},
    get TimeFormatter() {return WebpackModules.getByProps("dateFormat");},

    /* Strings and Utils */
    get Strings() {return WebpackModules.getByProps("Messages").Messages;},
    get StringFormats() {return WebpackModules.getByProps("a", "z");},
    get StringUtils() {return WebpackModules.getByProps("toASCII");},

    /* URLs and Utils */
    get URLParser() {return WebpackModules.getByProps("Url", "parse");},
    get ExtraURLs() {return WebpackModules.getByProps("getArticleURL");},

    /* Drag & Drop */
    get DNDActions() {return WebpackModules.getByProps("beginDrag");},
    get DNDSources() {return WebpackModules.getByProps("addTarget");},
    get DNDObjects() {return WebpackModules.getByProps("DragSource");},

    /* Media Stuff (Audio/Video) */
    get MediaDeviceInfo() {return WebpackModules.getByProps("Codecs", "SUPPORTED_BROWSERS");},
    get MediaInfo() {return WebpackModules.getByProps("getOutputVolume");},
    get MediaEngineInfo() {return WebpackModules.getByProps("MediaEngineFeatures");},
    get VoiceInfo() {return WebpackModules.getByProps("EchoCancellation");},
    get VideoStream() {return WebpackModules.getByProps("getVideoStream");},
    get SoundModule() {return WebpackModules.getByProps("playSound");},

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

    /* Commonly Used Classes */
    get GuildClasses() {
        const guildsWrapper = WebpackModules.getByProps("base", "guilds");
        const guilds = WebpackModules.getByProps("wrapper", "acronym");
        const pill = WebpackModules.getByProps("circleIconButton");
        const listItem = WebpackModules.getModule(m => m.listItem && !m.pill && !m.sidebar);
        return Object.assign({}, guildsWrapper, guilds, pill, listItem);
    },

    get LayerStack() {return WebpackModules.getByProps("pushLayer");}
});
