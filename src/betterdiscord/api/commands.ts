import CommandManager, {CommandTypes, InputTypes, MessageEmbedTypes, OptionTypes} from "@modules/commandmanager";

/**
 * `CommandAPI` is a utility class for managing commands. Instance is accessible through the BdApi.
 * This allows plugins to register and manage their own commands.
 * @type CommandAPI
 * @summary {@link CommandAPI} is a utility class for managing commands.
 * @name CommandAPI
 */
class CommandAPI {
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
    register(callerOrCommand: string | object, command: object) {
        const caller = (this.#callerName || callerOrCommand) as string;
        const commandObj = (this.#callerName ? callerOrCommand : command) as object;

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
    unregister(callerOrCommandId: string, commandId: string) {
        const caller = this.#callerName || callerOrCommandId;
        const finalCommandId = this.#callerName ? callerOrCommandId : commandId;

        if (!this.#validateUnregistration(caller, finalCommandId)) {
            return;
        }

        CommandManager.unregisterCommand(caller, finalCommandId);
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