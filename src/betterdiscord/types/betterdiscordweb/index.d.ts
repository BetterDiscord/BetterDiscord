export interface Addon {
    id: number;
    name: string;
    file_name: string;
    type: AddonType;
    description: string;
    version: string;
    author: Author;
    likes: number;
    downloads: number;
    tags: Tag[];
    thumbnail_url: null | string;
    latest_source_url: string;
    initial_release_date: Date;
    latest_release_date: Date;
    guild: Guild | null;
}

export interface Author {
    github_id: string;
    github_name: string;
    display_name: string;
    discord_name: string;
    discord_avatar_hash: null | string;
    discord_snowflake: string;
    guild: Guild | null;
}

export interface Guild {
    name: string;
    snowflake: string;
    invite_link: string;
    avatar_hash: null | string;
}

export enum Tag {
    Activity = "activity",
    Channels = "channels",
    Chat = "chat",
    Developers = "developers",
    Edit = "edit",
    Emotes = "emotes",
    Enhancement = "enhancement",
    Friends = "friends",
    Fun = "fun",
    Game = "game",
    Library = "library",
    Members = "members",
    Notifications = "notifications",
    Organization = "organization",
    Roles = "roles",
    Search = "search",
    Security = "security",
    Servers = "servers",
    Shortcut = "shortcut",
    Status = "status",
    Text = "text",
    Utility = "utility",
    Voice = "voice",
}

export type AddonType = "plugin" | "theme";
