export interface Addon {
    added: number;
    author: string;
    authorId?: string;
    authorLink?: string;
    description: string;
    donate?: string;
    fileContent?: string;
    filename: string;
    format: string;
    id: string;
    invite?: string;
    modified: number;
    name: string;
    partial?: boolean;
    patreon?: string;
    size: number;
    slug: string;
    source?: string;
    version: string;
    website?: string;
    runAt?: string;
    icon?: string;
}

export type AddonType = "plugin" | "theme";