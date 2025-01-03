import Patcher from "@modules/patcher";
import Webpack from "./api/webpack";
import { Filters } from "@modules/webpackmodules";
import Logger from "@common/logger";
import React from "@modules/react";
import BDLogo from "@ui/icons/bdlogo";
import pluginmanager from "./pluginmanager";

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

const iconClasses = {...Webpack.getModule(x => x.wrapper && x.icon && x.selected && x.selectable && !x.mask), builtInSeparator: Webpack.getModule(x=>x.builtInSeparator).builtInSeparator}
const ApplicationIcons = Webpack.getWithKey(Webpack.Filters.byStrings(".type===", ".BUILT_IN?"), {
    target: Webpack.getModule((e, m) => Webpack.modules[m.id].toString().includes("hasSpaceTerminator:"))
});
const ApplicationCommandIndexStore = Webpack.getWithKey(Filters.byStrings('.getScoreWithoutLoadingLatest'));
const BuiltInModule = Webpack.getWithKey(Filters.byStrings('.BUILT_IN_INTEGRATION'));

class MainCommandAPI {
    static #commands = new Map();
    static #sections = new Map();
    static #initialized = false;

    static start() {
        if (this.#initialized) {
            Logger.warn('MainCommandAPI is already initialized');
            return;
        }
        this.#patchCommandSystem();
        this.#initialized = true;
    }

    static stop() {
        Patcher.unpatchAll();
        this.#commands.clear();
        this.#sections.clear();
        this.#initialized = false;
    }

    static #patchCommandSystem() {
        /* Code for later. Will be sidebar patch. */
        /*Patcher.after('CommandsManager', sidebarModule, "Z", (_, args, res) => {
            const Unpatch = Patcher.after('CommandsManager', res, 'type', (_,args, res) => {
                Unpatch()
                console.log(args, res)
            })
        });*/

        Patcher.after('CommandsManager', ...BuiltInModule, (_, args, commands) => {
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

            const sections = Array.from(this.#sections.values());
            sections.forEach(section => {
                const commands = this.getCommandsByCaller(section.id);
                if (commands.length > 0) {
                    res.sectionedCommands.push({
                        section,
                        data: commands.map(command => this.#formatCommand(command))
                    });
                    res.descriptors.push(section);
                    res.commands.push(...commands.map(command => this.#formatCommand(command)));
                }
            });

            return res;
        });

        Patcher.after('CommandsManager', ...ApplicationIcons, (that, [{ id }], res) => {
            let iconUrl = pluginmanager.getAddon(id)?.icon ?? null;

            function Logo({ width, height, padding = 0, className, isSelected, selectable }) {
                const acronym = id
                    .split('-')
                    .map(part => part[0]?.toUpperCase() || '')
                    .join('') || 
                    id.split(' ')
                    .map(part => part[0]?.toUpperCase() || '')
                    .join('');
        
                return React.createElement(
                    "div",
                    {
                        style: { width, height, padding },
                        className: [
                            selectable && iconClasses.selectable,
                            isSelected && iconClasses.selected,
                            iconClasses.wrapper,
                            iconClasses.icon,
                            className
                        ].filter(Boolean).join(' ')
                    },
                    iconUrl
                        ? React.createElement("img", {
                            src: iconUrl,
                            alt: acronym,
                            style: { width: "100%", height: "100%" }
                        })
                        : React.createElement(
                            "span",
                            {
                                style: {
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: Math.min(width, height) / 1.2,
                                    backgroundColor: "transparent",
                                    borderRadius: "50%",
                                    width: "100%",
                                    fontWeight: 'bold',
                                    height: "100%"
                                }
                            },
                            acronym
                        )
                );
            }
        
            return this.#sections.has(id) ? Logo : res;
        });  
    }

    static #formatCommand(command) {
        if (!command?.id || !command?.name || !command?.execute) {
            return 'Invalid command format: missing required properties';
        }
    
        return {
            get id() { return command.id; },
            get __registerId() { return command.id; },
            get applicationId() { return command.caller; },
            get displayName() { return command.name; },
            get target() { return 1; },
            get name() { return command.name },
            get untranslatedName() { return command.name },
            get type() { return command.type || CommandTypes.CHAT_INPUT; },
            get inputType() { return command.inputType || InputTypes.BUILT_IN; },
            get displayDescription() { return command.description || ""; },
            get description() { return command.description || ""; },
            get untranslatedDescription() { return command.description || ""; },
            get options() { return command.options || []; },
            get execute() { return command.execute; },
            get integrationType() { return command.integrationType || 0; },
            get integrationTitle() { return command.integrationTitle || command.caller; }
        };
    }

    static registerCommand(caller, command) {
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
        pluginCommands.set(commandId, command);
        this.#commands.set(caller, pluginCommands);

        if (!this.#sections.has(caller)) {
            this.#sections.set(caller, {
                id: caller,
                name: caller,
                type: 0,
                icon: "https://github.com/BetterDiscord.png"
            });
        }
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
