export interface BdWebAddon {
    id: number;
    name: string;
    file_name: string;
    type: BdWebAddonType;
    description: string;
    version: string;
    author: BdWebAuthor;
    likes: number;
    downloads: number;
    tags: BdWebTag[];
    thumbnail_url?: string;
    latest_source_url: string;
    initial_release_date: Date;
    latest_release_date: Date;
    guild: BdWebGuild | null;
}

export interface BdWebAuthor {
    github_id: string;
    github_name: string;
    display_name: string;
    discord_name: string;
    discord_avatar_hash: null | string;
    discord_snowflake: string;
    guild: BdWebGuild | null;
}

export interface BdWebGuild {
    name: string;
    snowflake: string;
    invite_link: string;
    avatar_hash?: string;
}

export enum BdWebTag {
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

export type BdWebAddonType = "plugin" | "theme";
