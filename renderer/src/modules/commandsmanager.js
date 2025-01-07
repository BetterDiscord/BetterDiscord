import Patcher from "@modules/patcher";
import Webpack from "./api/webpack";
import {Filters} from "@modules/webpackmodules";
import React from "@modules/react";
import pluginmanager from "./pluginmanager";

export const CommandTypes = {
    CHAT_INPUT: 1,
    USER: 2,
    MESSAGE: 3
};

export const InputTypes = {
    BUILT_IN: 0,
    TEXT: 1,
    SEARCH: 2
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

/**
 * @typedef {{
*      CHAT_INPUT: 1,
*      USER: 2,
*      MESSAGE: 3
* }} CommandTypes
*/

/**
* @typedef {{
*      BUILT_IN: 0,
*      TEXT: 1,
*      SEARCH: 2
* }} InputTypes
*/

/**
* @typedef {{
*      SUB_COMMAND: 1,
*      SUB_COMMAND_GROUP: 2,
*      STRING: 3,
*      INTEGER: 4,
*      BOOLEAN: 5,
*      USER: 6,
*      CHANNEL: 7,
*      ROLE: 8,
*      MENTIONABLE: 9,
*      NUMBER: 10,
*      ATTACHMENT: 11
* }} OptionTypes
*/

/**
* @typedef {1 | 2 | 3} CommandType
*/

/**
* @typedef {0 | 1 | 2} InputType
*/

/**
* @typedef {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11} OptionType
*/

const iconClasses = {
    ...Webpack.getModule(x => x.wrapper && x.icon && x.selected && x.selectable && !x.mask),
    builtInSeparator: Webpack.getModule(x => x.builtInSeparator)?.builtInSeparator
};

const getAcronym = (e) =>
    e != null
        ? e.replace(/"s /g, " ").replace(/\w+/g, a => a[0]).replace(/\s/g, "").slice(0, 2)
        : "";

const User = Webpack.getByStrings("hasHadPremium(){");
const createBotMessage = Webpack.getByStrings("username:\"Clyde\"", {searchExports: true});
const MessagesModule = Webpack.getModule(x => x.receiveMessage);
const IconsModule = Webpack.getModule(x => x.BOT_AVATARS);

const localBDBot = new User({
    avatar: "betterdiscord",
    id: "676620914632294467",
    bot: true,
    username: "BetterDiscord",
    system: true,
});

const isValidImageUrl = (url) => {
    try {
        const validatedUrl = new URL(url);
        return ((validatedUrl.protocol === "data:" && validatedUrl.pathname.startsWith("image/")) || validatedUrl.protocol === "https:");
    }
    catch (e) {
        return false;
    }
};

class MainCommandAPI {
    static #commands = new Map();
    static #sections = new Map();

    static start() {
        this.#patchCommandSystem();
    }

    static #patchCommandSystem() {
        this.#patchSidebarModule();
        this.#patchCommandHandlers();
        this.#patchApplicationIcons();
        this.#patchIndexStore();

        IconsModule.BOT_AVATARS.betterdiscord = "https://github.com/BetterDiscord.png";
    }

    static #patchSidebarModule() {
        const SidebarModule = Webpack.getByStrings(".BUILT_IN?", "categoryListRef:", {defaultExport: false});

        Patcher.instead("CommandsManager", SidebarModule, "Z", (that, [props], original) => {
            const sections = [...props.sections];

            const index = sections.findIndex(section => section.id === "-1");
            if (index !== -1) {
                const bdSections = sections.splice(index + 1);
                const builtIn = sections.pop();

                sections.push(...bdSections, builtIn);
            }

            const result = original.call(that, {...props, sections});
            const child = result.props.children;

            if (child.props?.__bdPatched) return result;

            result.props.children = React.cloneElement(child, {
                renderCategoryListItem: (...args) => {
                    const ret = child.props.renderCategoryListItem(...args);
                    const nextSection = sections[args[1] + 1];

                    if (nextSection && nextSection.id === "-1") {
                        return React.cloneElement(ret, {
                            children: [
                                ...ret.props.children,
                                React.createElement("hr", {className: iconClasses.builtInSeparator})
                            ]
                        });
                    }

                    return React.cloneElement(ret, {
                        ...ret.props,
                        icon: nextSection?.icon
                    });
                },
                __bdPatched: true
            });

            return result;
        });
    }

    static #patchIndexStore() {
        const [mod, key] = Webpack.getWithKey(Filters.byStrings(".getScoreWithoutLoadingLatest"));

        Patcher.after("CommandsManager", mod, key, (that, args, res) => {
            if (!args[2].commandTypes.includes(CommandTypes.CHAT_INPUT)) return res;

            for (const sectionedCommand of res.sectionedCommands) {
                if (sectionedCommand.section.id !== "-1") continue;
                sectionedCommand.data = sectionedCommand.data.filter(m => !m.isBD);
            }

            for (const section of this.#sections.values()) {
                const commands = this.getCommandsByCaller(section.id);
                if (commands.length > 0) {
                    res.sectionedCommands.push({
                        section,
                        data: commands
                    });
                    res.descriptors.push(section);
                    res.commands.push(...commands);
                }
            }

            return res;
        });
    }

    static #patchCommandHandlers() {
        const [mod, key] = Webpack.getWithKey(Filters.byStrings(".BUILT_IN_INTEGRATION"));

        Patcher.after("CommandsManager", mod, key, (_, __, commands) => {
            const allCommands = Array.from(this.#commands.values())
                .flatMap(commandMap => Array.from(commandMap.values()));

            return [...commands, ...allCommands];
        });
    }

    static #patchApplicationIcons() {
        const [mod, key] = Webpack.getWithKey(Webpack.Filters.byStrings(".type===", ".BUILT_IN?"), {
            target: Webpack.getModule((e, m) => Webpack.modules[m.id].toString().includes("hasSpaceTerminator:"))
        });

        Patcher.after("CommandsManager", mod, key, (that, [{id}], res) => {
            const getIconUrl = () => {
                const metadataIcon = pluginmanager.getAddon(id)?.icon ?? null;
                const sectionIcon = this.#sections.has(id) ? this.#sections.get(id)?.icon : null;
                return metadataIcon || sectionIcon;
            };

            const iconUrl = getIconUrl();
            const acronym = getAcronym(id);

            const Logo = ({width, height, padding = 0, className, isSelected, selectable}) => {
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

    static registerCommand(caller, command) {
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

    static #formatCommand(caller, command, commandId) {
        return {
            ...command,
            get id() {return commandId;},
            get __registerId() {return commandId;},
            get applicationId() {return caller;},
            get displayName() {return command.name || "";},
            get target() {return CommandTypes.CHAT_INPUT;},
            get name() {return command.name || "";},
            get description() {return command.description || "";},
            get displayDescription() {return command.description || "";},
            get options() {return MainCommandAPI.#formatOptions(command.options);},
            execute: this.#patchExecuteFunction(command.execute),
            get integrationType() {return command.integrationType || 0;},
            get integrationTitle() {return command.integrationTitle || caller;},
            isBD: true
        };
    }
    
    static #formatOptions(options) {
        if (!options) return [];
        
        return options.map(option => ({
            ...option,
            get name() {return option.name;},
            get description() {return option.description;},
            get displayDescription() {return option.description;},
            type: option.type,
            get required() {return option.required || false;},
            get choices() {
                return option.choices?.map(choice => ({
                    ...choice,
                    get name() {return choice.name;},
                    get displayName() {return choice.name;}
                }));
            },
            get displayName() {return option.name;}
        }));
    }

    static #ensureSection(caller) {
        if (!this.#sections.has(caller)) {
            this.#sections.set(caller, {
                id: caller,
                name: caller,
                type: 0,
                key: "1",
                isBD: true
            });
        }
    }

    static #patchExecuteFunction(originalExecute) {
        return (data, {channel, guild}) => {
            const result = originalExecute(data, {channel, guild});

            this.sendBotMessage(result, {channel, guild});

            return result;
        };
    }

    static async sendBotMessage(result, {channel}) {
        try {
            result = await result;
        }
        catch (error) {
            return;
        }
    
        if (!(result !== null && typeof result === "object" && !Array.isArray(result))) {
            return;
        }
    
        const loadingMessage = createBotMessage({
            channelId: channel.id,
            content: typeof result.content === "string" ? result.content : undefined,
            loggingName: undefined,
            type: 20
        });
    
        if (typeof result.embeds === "object" && result.embeds !== null) {
            loadingMessage.embeds = Array.isArray(result.embeds) 
                ? result.embeds 
                : [result.embeds];
    
            loadingMessage.embeds = loadingMessage.embeds.map(embed => ({
                ...embed,
                type: embed.type || "rich"
            }));
        }
    
        Object.assign(loadingMessage, {
            author: localBDBot
        });
    
        if (loadingMessage.content || (Array.isArray(loadingMessage.embeds) && loadingMessage.embeds.length > 0)) {
            MessagesModule.receiveMessage(channel.id, loadingMessage, true);
        }
    }

    static unregisterCommand(caller, commandId) {
        const fullCommandId = `bd-${caller}-${commandId}`;
        const pluginCommands = this.#commands.get(caller);
        
        if (pluginCommands?.delete(fullCommandId)) {
            if (pluginCommands.size === 0) {
                this.#commands.delete(caller);
                this.#sections.delete(caller);
            }
        }
    }

    static unregisterAll(caller) {
        this.#commands.delete(caller);
        this.#sections.delete(caller);
    }

    static getCommandsByCaller(caller) {
        return Array.from(this.#commands.get(caller)?.values() || []);
    }
}

Object.freeze(MainCommandAPI);
Object.freeze(MainCommandAPI.prototype);
Object.freeze(MainCommandAPI.constructor);
export default MainCommandAPI;