import Patcher from "@modules/patcher";
import React from "@modules/react";
import pluginmanager from "./pluginmanager";
import Logger from "@common/logger";
import {Filters, getByKeys, getByStrings, getModule, getStore, getWithKey, modules} from "@webpack";
import type {FluxStore} from "discord/modules";
import type {Channel, Guild} from "discord/structs";

// TODO: create better types for this file, too many "any"

export const CommandTypes = {
    CHAT_INPUT: 1,
    USER: 2,
    MESSAGE: 3
};

export const InputTypes = {
    BUILT_IN: 0,
    TEXT: 1,
    SEARCH: 2,
    BOT: 3,
    PLACEHOLDER: 4
};

export const OptionTypes = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
    ATTACHMENT: 11
};

export const MessageEmbedTypes = {
    IMAGE: "image",
    VIDEO: "video",
    LINK: "link",
    ARTICLE: "article",
    TWEET: "tweet",
    RICH: "rich",
    GIFV: "gifv",
    APPLICATION_NEWS: "application_news",
    AUTO_MODERATION_MESSAGE: "auto_moderation_message",
    AUTO_MODERATION_NOTIFICATION: "auto_moderation_notification",
    TEXT: "text",
    POST_PREVIEW: "post_preview",
    GIFT: "gift",
    SAFETY_POLICY_NOTICE: "safety_policy_notice",
    SAFETY_SYSTEM_NOTIFICATION: "safety_system_notification",
    VOICE_CHANNEL: "voice_channel",
    GAMING_PROFILE: "gaming_profile",
};

export const enum OptionType {
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,
    CHANNEL = 7,
    ROLE = 8,
    MENTIONABLE = 9,
    NUMBER = 10,
    ATTACHMENT = 11
}

export interface Choice {
    name: string,
    value: string | number;
}

export interface Option {
    description?: string,
    name: string,
    required?: boolean,
    type: OptionType,
    maxLength?: number,
    minLength?: number,
    maxValue?: number,
    minValue?: number,
    choices?: Choice[];
}

export interface Command {
    name: string,
    description?: string,
    id: string,
    options?: Option[],
    execute(options: any[], {channel, guild}: {channel: Channel, guild?: Guild;}): void,
    predicate?(): boolean;
}

const iconClasses = {
    ...getModule<any>(x => x.wrapper && x.icon && x.selected && x.selectable && !x.mask, {firstId: 60090, cacheId: "core-commandmanager-iconClasses"}),
    builtInSeparator: getModule<any>(x => x.builtInSeparator, {firstId: 681755, cacheId: "core-commandmanager-builtInSeparatorClasses"})?.builtInSeparator
};

const getAcronym = (input: string) => input?.replace(/'s /g, " ").match(/\b\w/g)?.join("").slice(0, 2) ?? "";

const isValidImageUrl = (url: string) => {
    try {
        const validatedUrl = new URL(url);
        return ((validatedUrl.protocol === "data:" && validatedUrl.pathname.startsWith("image/")) || validatedUrl.protocol === "https:");
    }
    catch {
        return false;
    }
};

class CommandManager {
    static #commands = new Map<string, Map<string, Command>>();
    static #sections = new Map<string, {
        id: string,
        name: string,
        type: 1,
        key: string,
        icon?: string | null,
        isBD?: boolean;
    }>();

    static User = getByStrings<any>(["hasHadPremium(){"], {firstId: 427157, cacheId: "core-commandmanager-user"});
    static createBotMessage = getByStrings<any>(["username:\"Clyde\""], {searchExports: true, firstId: 963852, cacheId: "core-commandmanager-createBotMessage"});
    static MessagesModule = getByKeys<any>(["receiveMessage"], {firstId: 843472, cacheId: "core-commandmanager-messages"});
    static IconsModule = getByKeys<any>(["BOT_AVATARS"], {firstId: 820883, cacheId: "core-commandmanager-icons"});
    static localBDBot: any;

    static initialize() {
        this.#patchCommandSystem();
    }

    static #patchCommandSystem() {
        this.localBDBot = new this.User({
            avatar: "betterdiscord",
            id: "676620914632294467",
            bot: true,
            username: "BetterDiscord",
            system: true,
        });

        this.#patchSidebarModule();
        this.#patchQuery();
        this.#patchApplicationIcons();
        this.#patchIndexStore();
        this.#patchAuthorizer();

        this.IconsModule.BOT_AVATARS.betterdiscord = "https://github.com/BetterDiscord.png";
    }

    static #patchSidebarModule() {
        const SidebarModule = getByStrings<{A(p: {sections: any[];}): void;}>([".BUILT_IN?", "categoryListRef:"], {defaultExport: false});

        Patcher.after("CommandManager", SidebarModule!, "A", (_, [props]: [{sections: any[];}], res: any) => {
            if (!this.#sections.size) return;

            const child = res.props.children;

            if (child.props?.__bdPatched) return;

            res.props.children = React.cloneElement(child, {
                renderCategoryListItem: (...args: any[]) => {
                    const ret = child.props.renderCategoryListItem(...args);

                    if (!props.sections[args[1] - 1]?.isBD && props.sections[args[1]].isBD) {
                        return React.cloneElement(ret, {
                            children: [
                                React.createElement("hr", {className: iconClasses.builtInSeparator}),
                                ...ret.props.children
                            ]
                        });
                    }

                    return ret;
                },
                __bdPatched: true
            });
        });
    }

    static #patchIndexStore() {
        const [mod, key] = getWithKey(Filters.byStrings(".getScoreWithoutLoadingLatest"), {firstId: 264322, cacheId: "core-commandmanager-indexstore"});

        Patcher.after("CommandManager", mod, key, (_, args: any, res: any) => {
            if (!args[2].commandTypes.includes(CommandTypes.CHAT_INPUT)) return res;

            for (const sectionedCommand of res.sectionedCommands) {
                if (sectionedCommand.section.id !== "-1") continue;
                sectionedCommand.data = sectionedCommand.data.filter((m: any) => !m.isBD);
            }

            let descriptorsIndex = res.descriptors.findIndex((value: any) => value.id === "-1");
            let sectionedCommandsIndex = res.sectionedCommands.findIndex((value: any) => value.section.id === "-1");

            for (const section of this.#sections.values()) {
                const commands = this.getCommandsByCaller(section.id);
                if (commands.length > 0) {
                    res.sectionedCommands.splice(sectionedCommandsIndex++, 0, {
                        section,
                        data: commands
                    });
                    res.descriptors.splice(descriptorsIndex++, 0, section);
                    res.commands.push(...commands);
                }
            }
            return res;
        });
    }

    static #patchQuery() {
        const ApplicationCommandIndexStore = getStore("ApplicationCommandIndexStore")! as FluxStore & {query: (a: any, p: {text: string; commandTypes: any;}) => any;};

        Patcher.after("CommandManager", ApplicationCommandIndexStore, "query", (_, args: [any, {text: string; commandTypes: any;}], res: any) => {
            if (!args[1].commandTypes.includes(CommandTypes.CHAT_INPUT)) return res;

            const text = args[1].text || "";

            for (const sectionedCommand of res.sectionedCommands) {
                if (sectionedCommand.section.id !== "-1") continue;
                sectionedCommand.data = sectionedCommand.data.filter((m: any) => !m.isBD);
            }

            for (const section of this.#sections.values()) {
                const commands = this.getCommandsByCaller(section.id).filter((cmd: any) => cmd.name.includes(text) || cmd.description.includes(text));

                if (commands.length > 0) {
                    res.sectionedCommands.push({
                        section,
                        data: commands
                    });
                    res.descriptors.push(section);
                    res.commands.unshift(...commands);
                }
            }
        });
    }

    static #patchApplicationIcons() {
        const [mod, key] = getWithKey(Filters.byStrings(".type===", ".BUILT_IN?"), {
            target: getModule((_, m) => modules[m.id].toString().includes("hasSpaceTerminator:"), {firstId: 826298, cacheId: "core-commandmanager-appIcons"})
        });

        Patcher.after("CommandManager", mod as {[key: Extract<keyof typeof mod, string>]: (o: {id: string;}) => any;}, key as Extract<keyof typeof mod, string>, (_, [{id}]: [{id: string;}], res: any) => {
            const getIconUrl = () => {
                // @ts-expect-error cba
                const metadataIcon = pluginmanager.getAddon(id)?.icon || pluginmanager.getPlugin(id)?.instance?.icon || null;
                const sectionIcon = this.#sections.has(id) ? this.#sections.get(id)?.icon : null;
                return metadataIcon || sectionIcon;
            };

            const iconUrl = getIconUrl();
            const acronym = getAcronym(id);

            const Logo = ({width, height, padding = 0, className, isSelected, selectable}: any) => {
                const wrapperClasses = [
                    selectable && iconClasses.selectable,
                    isSelected && iconClasses.selected,
                    iconClasses.wrapper,
                    iconClasses.icon,
                    className
                ].filter(Boolean).join(" ");

                const iconStyle = {width, height, padding};

                const renderImageIcon = () => (
                    <img src={iconUrl} alt={acronym} style={{width: "100%", height: "100%"}} />
                );

                const renderAcronymIcon = () => (
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: Math.min(width, height) / 1.2,
                            backgroundColor: "transparent",
                            borderRadius: "50%",
                            width: "100%",
                            fontWeight: "bold",
                            height: "100%",
                        }}
                    >
                        {acronym}
                    </span>
                );

                const renderIcon = () => {
                    if (typeof iconUrl === "function") {
                        return React.createElement(iconUrl);
                    }
                    if (typeof iconUrl === "string" && isValidImageUrl(iconUrl)) {
                        return renderImageIcon();
                    }
                    return renderAcronymIcon();
                };

                return React.createElement(
                    "div",
                    {
                        style: iconStyle,
                        className: wrapperClasses
                    },
                    renderIcon()
                );
            };

            return this.#sections.has(id) ? Logo : res;
        });
    }

    static #patchAuthorizer() {
        const [module, key] = getWithKey(Filters.byStrings("openOAuth2Modal", "Promise.resolve", "commandIntegrationTypes"), {
            firstId: 972995,
            cacheId: "core-commandmanager-authorizer"
        });

        Patcher.instead("CommandManager", module, key, (that, args: any, original) => {
            if (this.#sections.has(args[0]?.applicationId)) {
                return Promise.resolve({
                    isAuthorized: true
                });
            }

            return original.apply(that, args);
        });
    }

    static registerCommand(caller: string, command: Command) {
        if (!caller || !command?.name || !command?.execute) {
            throw new Error("Command must have a caller, name, and execute function");
        }

        const pluginCommands = this.#commands.get(caller) || new Map();
        const commandId = `bd-${caller}-${command.id}`;

        if (pluginCommands.has(commandId)) {
            throw new Error(`Command with id ${commandId} is already registered`);
        }

        const formattedCommand = this.#formatCommand(caller, command, commandId);
        pluginCommands.set(commandId, formattedCommand);
        this.#commands.set(caller, pluginCommands);

        this.#ensureSection(caller);

        return () => this.unregisterCommand(caller, command.id);
    }

    static #formatCommand(caller: string, command: Command, commandId: string) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self: any = this;

        return {
            integrationType: 0,
            integrationTitle: caller,
            inputType: InputTypes.BUILT_IN,
            get id() {return commandId;},
            get __registerId() {return commandId;},
            get applicationId() {return caller;},
            get displayName() {return command.name || "";},
            get target() {return CommandTypes.CHAT_INPUT;},
            get name() {return command.name || "";},
            get description() {return command.description || "";},
            get displayDescription() {return command.description || "";},
            get options() {return CommandManager.#formatOptions(command.options);},
            execute: this.#patchExecuteFunction(command),
            get section() {self.#ensureSection(caller); return self.#sections.get(caller);},
            isBD: true,
            __proto__: command
        };
    }

    private static optionsMap = new WeakMap<Option[], Option[]>();
    static #formatOptions(options?: Option[]): Option[] {
        if (!options) return [];

        if (this.optionsMap.has(options)) {
            return this.optionsMap.get(options)!;
        }

        const opts = options.map((option: any) => ({
            get name() {return option.name;},
            get description() {return option.description;},
            get displayDescription() {return option.description;},
            type: option.type,
            get required() {return option.required || false;},
            get choices() {
                return option.choices?.map((choice: any) => ({
                    ...choice,
                    get name() {return choice.name;},
                    get displayName() {return choice.name;}
                }));
            },
            get displayName() {return option.name;},
            __proto__: option
        }));

        this.optionsMap.set(options, opts);

        return opts;
    }

    static #ensureSection(caller: string) {
        if (!this.#sections.has(caller)) {
            this.#sections.set(caller, {
                id: caller,
                name: caller,
                type: 1,
                key: "1",
                icon: caller === "BetterDiscord" ? "https://github.com/BetterDiscord.png" : null,
                isBD: true
            });
        }
    }

    static #patchExecuteFunction(command: Command) {
        return (data: any, {channel, guild}: any) => {
            try {
                const result = command.execute(data, {channel, guild});

                if (!("inputType" in command) || command.inputType === InputTypes.BUILT_IN) {
                    this.sendBotMessage(result, {channel, guild});
                }

                return result;
            }
            catch (error) {
                Logger.stacktrace("CommandManager", `Failed to run execute() for command ${command.name}`, error as Error);
            }
        };
    }

    static async sendBotMessage(result: any, {channel}: any) {
        try {
            result = await result;
        }
        catch (error) {
            return Logger.stacktrace("CommandManager", "Failed to get result of execute()", error as Error);
        }

        if (!(result !== null && typeof result === "object" && !Array.isArray(result))) {
            return;
        }

        const loadingMessage = this.createBotMessage({
            channelId: channel.id,
            content: typeof result.content === "string" ? result.content : undefined,
            loggingName: undefined,
            type: 20
        });

        if (typeof result.embeds === "object" && result.embeds !== null) {
            loadingMessage.embeds = Array.isArray(result.embeds)
                ? result.embeds
                : [result.embeds];

            loadingMessage.embeds = loadingMessage.embeds.map((embed: any) => ({
                ...embed,
                type: embed.type || "rich"
            }));
        }

        Object.assign(loadingMessage, {
            author: this.localBDBot
        });

        if (loadingMessage.content || (Array.isArray(loadingMessage.embeds) && loadingMessage.embeds.length > 0)) {
            this.MessagesModule.receiveMessage(channel.id, loadingMessage, true);
        }
    }

    static unregisterCommand(caller: string, commandId: string) {
        const fullCommandId = `bd-${caller}-${commandId}`;
        const pluginCommands = this.#commands.get(caller);

        if (pluginCommands?.delete(fullCommandId)) {
            if (pluginCommands.size === 0) {
                this.#commands.delete(caller);
                this.#sections.delete(caller);
            }
        }
    }

    static unregisterAll(caller: string) {
        this.#commands.delete(caller);
        this.#sections.delete(caller);
    }

    static getCommandsByCaller(caller: string) {
        return Array.from(this.#commands.get(caller)?.values() || []);
    }
}

export default CommandManager;