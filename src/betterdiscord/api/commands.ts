import CommandManager, {CommandTypes, InputTypes, MessageEmbedTypes, OptionTypes, type Command} from "@modules/commandmanager";

type RegisterArgs<Bounded extends boolean> = [
    ...(Bounded extends false ? [caller: string] : []),
    command: Command
];
type UnregisterArgs<Bounded extends boolean> = [
    ...(Bounded extends false ? [caller: string] : []),
    id: string
];

/**
 * `CommandAPI` is a utility class for managing commands. Instance is accessible through the BdApi.
 * This allows plugins to register and manage their own commands.
 * @type CommandAPI
 * @summary {@link CommandAPI} is a utility class for managing commands.
 * @name CommandAPI
 */
class CommandAPI<Bounded extends boolean> {
    #callerName = "";

    constructor(callerName?: string) {
        if (!callerName) return;
        this.#callerName = callerName;
    }

    Types = {
        OptionTypes,
        CommandTypes,
        InputTypes,
        MessageEmbedTypes
    };

    /**
     * Registers a new command
     * @param {string|object} callerOrCommand Caller name or command object if caller is preset
     * @param {object} [command] Command object (optional if caller is preset)
     * @returns {Function|undefined} Unregister function
     */
    register(...args: RegisterArgs<Bounded>) {
        const caller = (this.#callerName || args[0]) as string;
        const commandObj = args[this.#callerName ? 0 : 1] as Command;

        if (!this.#validateRegistration(caller, commandObj)) {
            return;
        }

        return CommandManager.registerCommand(caller, commandObj);
    }

    /**
     * Unregisters a command
     * @param {string} callerOrCommandId Caller name or command ID if caller is preset
     * @param {string} [commandId] Command ID (optional if caller is preset)
     */
    unregister(...args: UnregisterArgs<Bounded>) {
        const caller = (this.#callerName || args[0]) as string;
        const id = args[this.#callerName ? 0 : 1] as string;

        if (!this.#validateUnregistration(caller, id)) {
            return;
        }

        CommandManager.unregisterCommand(caller, id);
    }

    /**
     * @private
     */
    #validateRegistration(caller: string, command: any) {
        if (caller === "BetterDiscord") throw new Error("Plugins cannot register commands as BetterDiscord");
        return typeof caller === "string" && typeof command === "object" && command?.id && command?.name && command?.execute;
    }

    /**
     * @private
     */
    #validateUnregistration(caller: string, commandId: string) {
        return typeof caller === "string" && (!commandId || typeof commandId === "string");
    }

    /**
     * Unregisters all commands for a specific caller
     * @param {string} caller Name of the caller whose commands should be unregistered
     */
    unregisterAll(caller: string) {
        if (this.#callerName) caller = this.#callerName;
        CommandManager.unregisterAll(caller);
    }

    /**
     * Gets all commands registered by a specific caller
     * @param {string} caller Name of the caller whose commands should be retrieved
     * @returns {Array} Array of command objects registered by the caller
     */
    getCommandsByCaller(caller: string) {
        if (this.#callerName) caller = this.#callerName;
        return CommandManager.getCommandsByCaller(caller);
    }
}


Object.freeze(CommandAPI);
Object.freeze(CommandAPI.prototype);
Object.freeze(CommandAPI.prototype.Types);
Object.freeze(CommandAPI.constructor);
export default CommandAPI;