import Patcher from "@modules/patcher";
import Webpack from "./api/webpack";
import { Filters } from "@modules/webpackmodules";
import Logger from "@common/logger";
import React from "@modules/react";
import pluginmanager from "./pluginmanager";
import BDLogo from "@ui/icons/bdlogo";

const CommandTypes = {
    CHAT_INPUT: 1,
    USER: 2,
    MESSAGE: 3
};

const InputTypes = {
    BUILT_IN: 0,
    TEXT: 1,
    SEARCH: 2
};

const OptionTypes = {
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

const CommandsRegister = [
    {
        id: 'betterdiscord-toggle',
        name: 'toggle',
        displayName: 'Enable/Disable Plugin or Theme',
        description: 'Enables or disables a plugin or theme.',
        options: [
            {
                type: OptionTypes.STRING,
                name: 'type',
                description: 'The type (plugin/theme) to enable or disable',
                required: true,
                choices: [
                    { name: 'plugin', value: 'plugin' },
                    { name: 'theme', value: 'theme' }
                ]
            },
            {
                type: OptionTypes.STRING,
                name: 'name',
                description: 'The name of the plugin or theme to enable/disable',
                required: true,
                min_length: 1,
                max_length: 100
            }
        ],
        execute: (data) => {
            const type = data.find(option => option.name === 'type')?.value;
            const name = data.find(option => option.name === 'name')?.value;

            if (['plugin', 'theme'].includes(type)) {
                const targetApi = type === 'plugin' ? BdApi.Plugins : BdApi.Themes;
                const isEnabled = targetApi.isEnabled(name);
                isEnabled ? targetApi.disable(name) : targetApi.enable(name);
            }
            return { result: `Toggled ${type} ${name}`, send: false };
        }
    },
    {
        id: 'betterdiscord-plugin-info',
        name: 'info',
        displayName: 'Plugin/Theme Info',
        description: 'Gets information about a plugin or theme.',
        options: [
            {
                type: OptionTypes.STRING,
                name: 'type',
                description: 'The type (plugin/theme) to get info about',
                required: true,
                choices: [
                    { name: 'plugin', displayName: 'Plugin', value: 'plugin' },
                    { name: 'theme', displayName: 'Theme', value: 'theme' }
                ]
            },
            {
                type: OptionTypes.STRING,
                name: 'name',
                description: 'The name of the plugin or theme to get info about',
                required: true,
                min_length: 1,
                max_length: 100
            }
        ],
        execute: (data) => {
            const type = data.find(option => option.name === 'type')?.value;
            const name = data.find(option => option.name === 'name')?.value;

            if (type && name) {
                const pluginOrTheme = type === 'plugin' ? BdApi.Plugins.get(name) : BdApi.Themes.get(name);
                if (pluginOrTheme) {
                    const { name, isEnabled, version, author } = pluginOrTheme;
                    Logger.info(`Fetched info for ${type}: ${name}`);
                    return { result: `${name}, ${isEnabled ? 'Enabled' : 'Disabled'}, v${version}, ${author}`, send: false };
                } else {
                    Logger.error(`No ${type} found with the name: ${name}`);
                    return { result: `No ${type} found with the name: ${name}`, send: false };
                }
            }
        }
    },
    {
        id: 'betterdiscord-list-plugins-themes',
        name: 'list',
        displayName: 'List Plugins and Themes',
        description: 'Lists all installed plugins and/or themes.',
        options: [
            {
                type: OptionTypes.STRING,
                name: 'type',
                description: 'Specify whether to list plugins, themes, or both',
                required: false,
                choices: [
                    { name: 'plugin', displayName: 'Plugin', value: 'plugin' },
                    { name: 'theme', displayName: 'Theme', value: 'theme' },
                    { name: 'both', displayName: 'Both', value: 'both' }
                ]
            }
        ],
        execute: (data) => {
            const type = data.find(option => option.name === 'type')?.value;

            if (type === 'plugin' || type === 'both') {
                const plugins = BdApi.Plugins.getAll();
                let result = 'Listing all installed plugins:\n';
                plugins.forEach(plugin => {
                    const { name, version, isEnabled } = plugin;
                    result += `${name}, v${version}, ${isEnabled ? 'Enabled' : 'Disabled'}\n`;
                });
                return { result, send: false };
            }
            if (type === 'theme' || type === 'both') {
                const themes = BdApi.Themes.getAll();
                let result = 'Listing all installed themes:\n';
                themes.forEach(theme => {
                    const { name, version, isEnabled } = theme;
                    result += `${name}, v${version}, ${isEnabled ? 'Enabled' : 'Disabled'}\n`;
                });
                return { result, send: false };
            }
            if (!type || !['plugin', 'theme', 'both'].includes(type)) {
                return { result: 'Please specify "plugin", "theme", or "both" to list the items.', send: false };
            }
        }
    }
];

const iconClasses = {
    ...Webpack.getModule(x => x.wrapper && x.icon && x.selected && x.selectable && !x.mask),
    builtInSeparator: Webpack.getModule(x => x.builtInSeparator)?.builtInSeparator
};

const ApplicationIcons = Webpack.getWithKey(Webpack.Filters.byStrings(".type===", ".BUILT_IN?"), {
    target: Webpack.getModule((e, m) => Webpack.modules[m.id].toString().includes("hasSpaceTerminator:"))
});
const ApplicationCommandIndexStore = Webpack.getWithKey(Filters.byStrings('.getScoreWithoutLoadingLatest'));
const BuiltInModule = Webpack.getWithKey(Filters.byStrings('.BUILT_IN_INTEGRATION'));
const SidebarModule = Webpack.getByStrings(".BUILT_IN?", "categoryListRef:", { defaultExport: false })
const getAcronym = (e) =>
    e != null
        ? e.replace(/'s /g, " ").replace(/\w+/g, e => e[0]).replace(/\s/g, "").slice(0, 2)
        : "";

const User = Webpack.getByStrings('hasHadPremium(){')
const createBotMessage = Webpack.getByStrings('username:"Clyde"', { searchExports: true })
const MessagesModule = Webpack.getModule(x => x.receiveMessage)
const IconsModule = Webpack.getModule(x => x.BOT_AVATARS)

const isValidImageUrl = (url) => {
    try {
        const validatedUrl = new URL(url);
        return (
            (validatedUrl.protocol === 'data:' && validatedUrl.pathname.startsWith('image/')) ||
            validatedUrl.protocol === 'https:'
        );
    } catch (e) {
        return false;
    }
};

class MainCommandAPI {
    static #commands = new Map();
    static #sections = new Map();
    static #initialized = false;

    static start() {
        if (this.#initialized) {
            Logger.warn('MainCommandAPI is already initialized');
            return;
        }

        this.#initialized = true;
        this.#patchCommandSystem();

        CommandsRegister.forEach(command => {
            this.registerCommand('BetterDiscord', command, { icon: 'https://betterdiscord.app/resources/branding/logo_small.svg' });
        });
    }

    static stop() {
        Patcher.unpatchAll();
        this.#commands.clear();
        this.#sections.clear();
        this.#initialized = false;
    }

    static #patchCommandSystem() {
        this.#patchSidebarModule();
        this.#patchCommandHandlers();
        this.#patchApplicationIcons();

        IconsModule.BOT_AVATARS.betterdiscord = "https://github.com/BetterDiscord.png"
    }

    static #patchSidebarModule() {
        Patcher.instead('CommandsManager', SidebarModule, "Z", (that, [props], original) => {
            const sections = [...props.sections];

            const index = sections.findIndex(section => section.id === "-1");
            if (index !== -1) {
                const bdSections = sections.splice(index + 1);
                const builtIn = sections.pop();

                sections.push(...bdSections, builtIn);
            }

            const result = original.call(that, { ...props, sections });
            const child = result.props.children;

            if (child.props?.__bdPatched) return result;

            result.props.children = React.cloneElement(child, {
                renderCategoryListItem: (...args) => {
                    const ret = child.props.renderCategoryListItem(...args);
                    const nextSection = sections[args[1] + 1];

                    if (nextSection && nextSection.id === '-1') {
                        return React.cloneElement(ret, {
                            children: [
                                ...ret.props.children,
                                React.createElement("hr", { className: iconClasses.builtInSeparator })
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

    static #patchCommandHandlers() {
        Patcher.after('CommandsManager', ...BuiltInModule, (_, __, commands) => {
            const allCommands = Array.from(this.#commands.values())
                .flatMap(commandMap => Array.from(commandMap.values()))
                .map(command => ({
                    ...this.#formatCommand(command),
                    isBD: true
                }));

            return [...commands, ...allCommands];
        });

        Patcher.after('CommandsManager', ...ApplicationCommandIndexStore, (that, args, res) => {
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
                        data: commands.map(command => this.#formatCommand(command))
                    });
                    res.descriptors.push(section);
                    res.commands.push(...commands.map(command => this.#formatCommand(command)));
                }
            }

            return res;
        });
    }

    static #patchApplicationIcons() {
        Patcher.after('CommandsManager', ...ApplicationIcons, (that, [{ id }], res) => {
            const getIconUrl = () => {
                const metadataIcon = pluginmanager.getAddon(id)?.icon ?? null;
                const sectionIcon = this.#sections.has(id) ? this.#sections.get(id)?.icon : null;
                return metadataIcon || sectionIcon;
            };

            const iconUrl = getIconUrl();
            const acronym = getAcronym(id);

            const Logo = ({ width, height, padding = 0, className, isSelected, selectable }) => {
                const wrapperClasses = [
                    selectable && iconClasses.selectable,
                    isSelected && iconClasses.selected,
                    iconClasses.wrapper,
                    iconClasses.icon,
                    className
                ].filter(Boolean).join(' ');

                const iconStyle = { width, height, padding };

                const renderImageIcon = () => (
                    <img src={iconUrl} alt={acronym} style={{ width: '100%', height: '100%' }} />
                );

                const renderAcronymIcon = () => (
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: Math.min(width, height) / 1.2,
                            backgroundColor: 'transparent',
                            borderRadius: '50%',
                            width: '100%',
                            fontWeight: 'bold',
                            height: '100%',
                        }}
                    >
                        {acronym}
                    </span>
                );

                const renderIcon = () => {
                    if (typeof iconUrl === 'function') {
                        return React.createElement(iconUrl);
                    }
                    if (typeof iconUrl === 'string' && isValidImageUrl(iconUrl)) {
                        return renderImageIcon();
                    }
                    return renderAcronymIcon();
                };

                return React.createElement(
                    'div',
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

    static #formatCommand(command) {
        if (!command?.id || !command?.name || !command?.execute) {
            throw new Error('Invalid command format: missing required properties');
        }

        return {
            get id() { return command.id; },
            get __registerId() { return command.id; },
            get applicationId() { return command.caller; },
            get displayName() { return command.name || "" },
            get target() { return CommandTypes.CHAT_INPUT; },
            get name() { return command.name || "" },
            get description() { return command.description || ""; },
            get displayDescription() { return command.description || ""; },
            get options() { return command.options || []; },
            get execute() { return command.execute; },
            get integrationType() { return command.integrationType || 0; },
            get integrationTitle() { return command.integrationTitle || command.caller; }
        };
    }

    static registerCommand(caller, command, data) {
        if (!this.#initialized) {
            throw new Error('MainCommandAPI must be initialized before registering commands');
        }

        if (!caller || !command?.name || !command?.execute) {
            throw new Error('Command must have a caller, name, and execute function');
        }

        const pluginCommands = this.#commands.get(caller) || new Map();
        const commandId = command.id || `bd-${caller}-${command.displayName.toLowerCase()}`;

        if (pluginCommands.has(commandId)) {
            throw new Error(`Command with id ${commandId} is already registered`);
        }

        command.id = commandId;
        command.caller = caller;

        const originalExecute = command.execute;
        command.execute = this.#patchExecuteFunction(originalExecute);

        if (!command.option) command.option = [];

        if (command.options && command.options.length > 0) {
            const parsedOptions = command.options.map(option => ({
                name: option.name,
                description: option.description,
                type: option.type,
                required: option.required || false,
                choices: option.choices ? option.choices.map(choice => ({
                    ...choice,
                    name: choice.name,
                    displayName: choice.name
                })) : undefined,
                displayName: option.name
            }));

            command.options = parsedOptions;
        }

        pluginCommands.set(commandId, command);
        this.#commands.set(caller, pluginCommands);

        if (!this.#sections.has(caller)) {
            this.#sections.set(caller, {
                id: caller,
                name: caller,
                type: 0,
                key: '1',
                icon: data?.icon,
                isBD: true
            });
        }
    }

    static #patchExecuteFunction(originalExecute) {
        return (data, { channel, guild }) => {
            const result = originalExecute(data, { channel, guild });

            if (result?.result) {
                this.sendBotMessage(result.result, { channel, guild });
            }

            return result;
        };
    }

    static sendBotMessage(result, { channel, guild }) {
        const LocalUser = new User({
            avatar: "betterdiscord",
            id: '676620914632294467',
            bot: true,
            username: "BetterDiscord",
            system: true,
        });
        
        const loadingMessage = createBotMessage({
            channelId: channel.id,
            content: result,
            loggingName: "BetterDiscord",
            type: 20
        });

        Object.assign(loadingMessage, {
            author: LocalUser // User doesn't take a author argument.
        });

        MessagesModule.receiveMessage(channel.id, loadingMessage, true)
    }

    static unregisterCommand(caller, commandId) {
        const pluginCommands = this.#commands.get(caller);
        if (pluginCommands?.delete(commandId) && pluginCommands.size === 0) {
            this.#commands.delete(caller);
            this.#sections.delete(caller);
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

export default MainCommandAPI;
