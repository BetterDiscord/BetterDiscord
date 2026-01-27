import type {ForwardRefExoticComponent, MemoExoticComponent, JSX} from "react";
import * as ReactSpring from "@react-spring/web";



export interface RemoteModule {
    releaseChannel: string;
    version: string[];
    buildNumber: number;
    architecture: string;
    parsedOSRelease: number[];
    focus(): void;
    minimize(): void;
}

export type GetClientInfo = () => {
    buildNumber: string;
    logsUploaded: string;
    releaseChannel: string;
    versionHash: string;
};

export interface UserAgentInfo {
    description: string;
    layout: string;
    manufacturer: string | null;
    name: "Electron";
    os: {
        architecture: number;
        family: string;
        version: string;
        toString: () => string;
    };
    parse: () => void;
    prerelease: null;
    product: null;
    toString: () => string;
    ua: string;
    version: string;
}

export interface FluxStore {
    _dispatchToken: string;
    _isInitialized: boolean;
    getName(): string;
    getDispatchToken(): string;

    initialize(): void;
    initializeIfNeeded(): void;

    emitChange(): void;
    hasChangeCallbacks(): boolean;
    addChangeListener(listener: () => void): void;
    removeChangeListener(listener: () => void): void;
    addReactChangeListener(listener: () => void): void;
    removeReactChangeListener(listener: () => void): void;

    syncWith(stores: FluxStore[], emitChange: boolean, delay?: number): void;
    waitFor(...stores: FluxStore[]): void;

    [key: PropertyKey]: any;
}

export interface FluxStoreConstructor {
    new(dispatcher: unknown, handlers: unknown): FluxStore,
    getAll(): FluxStore[],
    prototype: FluxStore;
}

export type CommonlyUsedStores = (
    "UserStore" |
    "GuildStore" |
    "SelectedGuildStore" |
    "GuildMemberStore" |
    "ChannelStore" |
    "SelectedChannelStore" |
    "MessageStore"
);

export interface Dispatcher {
    register<T>(callback: (payload: T) => void): string;
    unregister(id: string): void;
    waitFor(IDs: string[]): void;
    dispatch<T>(payload: T): void;
    isDispatching(): boolean;
    subscribe<T extends (...args: any[]) => void>(id: string, cb: T): void;
    addInterceptor<T>(callback: (payload: T) => void): string;
}


export type Memo = MemoExoticComponent<ForwardRefExoticComponent<null> & JSX.ElementClass>;


export type ReactSpring = typeof ReactSpring;


export interface DiscordPermissions {
    ADD_REACTIONS: 64n;
    ADMINISTRATOR: 8n;
    ATTACH_FILES: 32768n;
    BAN_MEMBERS: 4n;
    CHANGE_NICKNAME: 67108864n;
    CONNECT: 1048576n;
    CREATE_EVENTS: 17592186044416n;
    CREATE_GUILD_EXPRESSIONS: 8796093022208n;
    CREATE_INSTANT_INVITE: 1n;
    CREATE_PRIVATE_THREADS: 68719476736n;
    CREATE_PUBLIC_THREADS: 34359738368n;
    DEAFEN_MEMBERS: 8388608n;
    EMBED_LINKS: 16384n;
    KICK_MEMBERS: 2n;
    MANAGE_CHANNELS: 16n;
    MANAGE_EVENTS: 8589934592n;
    MANAGE_GUILD: 32n;
    MANAGE_GUILD_EXPRESSIONS: 1073741824n;
    MANAGE_MESSAGES: 8192n;
    MANAGE_NICKNAMES: 134217728n;
    MANAGE_ROLES: 268435456n;
    MANAGE_THREADS: 17179869184n;
    MANAGE_WEBHOOKS: 536870912n;
    MENTION_EVERYONE: 131072n;
    MODERATE_MEMBERS: 1099511627776n;
    MOVE_MEMBERS: 16777216n;
    MUTE_MEMBERS: 4194304n;
    PRIORITY_SPEAKER: 256n;
    READ_MESSAGE_HISTORY: 65536n;
    REQUEST_TO_SPEAK: 4294967296n;
    SEND_MESSAGES: 2048n;
    SEND_MESSAGES_IN_THREADS: 274877906944n;
    SEND_POLLS: 562949953421312n;
    SEND_TTS_MESSAGES: 4096n;
    SEND_VOICE_MESSAGES: 70368744177664n;
    SET_VOICE_CHANNEL_STATUS: 281474976710656n;
    SPEAK: 2097152n;
    STREAM: 512n;
    USE_APPLICATION_COMMANDS: 2147483648n;
    USE_CLYDE_AI: 140737488355328n;
    USE_EMBEDDED_ACTIVITIES: 549755813888n;
    USE_EXTERNAL_APPS: 1125899906842624n;
    USE_EXTERNAL_EMOJIS: 262144n;
    USE_EXTERNAL_SOUNDS: 35184372088832n;
    USE_EXTERNAL_STICKERS: 137438953472n;
    USE_SOUNDBOARD: 4398046511104n;
    USE_VAD: 33554432n;
    VIEW_AUDIT_LOG: 128n;
    VIEW_CHANNEL: 1024n;
    VIEW_CREATOR_MONETIZATION_ANALYTICS: 2199023255552n;
    VIEW_GUILD_ANALYTICS: 524288n;
}

export interface InviteActions {
    resolveInvite(code: string): {code: string; invite: {code: string;};};
    getInviteContext(): void;
    createInvite(): void;
    mobileCreateInvite(): void;
    getAllFriendInvites(): void;
    createFriendInvite(): void;
    revokeFriendInvites(): void;
    revokeFriendInvite(): void;
    clearInviteFromStore(): void;
    revokeInvite(): void;
    acceptInvite(): void;
    acceptInviteAndTransitionToInviteChannel(): void;
    transitionToInvite(): void;
    transitionToInviteSync(): void;
    openNativeAppModal(): void;
    openApp(): void;
    transitionToInviteChannelSync(): void;
}


export type RuleTypes = "heading" | "nptable" | "lheading" | "hr" | "codeBlock" | "fence" | "blockQuote" | "list" | "def" | "table" | "newline" | "paragraph" | "escape" | "tableSeparator" | "autolink" | "mailto" | "url" | "link" | "image" | "reflink" | "refimage" | "em" | "strong" | "u" | "del" | "inlineCode" | "br" | "text";

export type Rule = {
    html?: (e: {content: string;}, t: (s: string, o: object) => string, n: object) => string;
    match: ((s: string, o: {inline: boolean;}) => RegExpExecArray) & {regex: RegExp;};
    order: number;
    parse: (e: RegExpExecArray, t: (s: string, o: object) => string, n: object) => {content: string;};
    react?: (e: Record<string, any>, t: (s: string, o: object) => string, n: object) => ReactElement;
    requiredFirstCharacters?: string[];
};

export type Rules = {
    [key in RuleTypes]: Rule;
};

export interface SimpleMarkdown {
    defaultRules: Rules;
    parserFor: (r: Rules) => (s: string, o?: {inline: boolean;}) => object;
    ruleOutput: (r: Rules, t: string) => object;
    reactFor: (o: object) => (o2: object) => ReactElement;
}