import CommandManager, {CommandTypes, InputTypes, MessageEmbedTypes, OptionTypes, type Command} from "@modules/commandmanager";

function validateRegistration(caller: string, command: any) {
    if (caller === "BetterDiscord") throw new Error("Plugins cannot register commands as BetterDiscord");
    return typeof caller === "string" && typeof command === "object" && command?.id && command?.name && command?.execute;
}

function validateUnregistration(caller: string, commandId: string) {
    return typeof caller === "string" && (!commandId || typeof commandId === "string");
}

const Types = {
    OptionTypes,
    CommandTypes,
    InputTypes,
    MessageEmbedTypes
}

/**
 * `CommandAPI` is a utility class for managing commands. Instance is accessible through the BdApi.
 * This allows plugins to register and manage their own commands.
 */
class CommandAPI {
    Types = Types;

    /**
     * Registers a new command
     * @param caller Caller name
     * @param command Command object
     * @returns Unregister function
     */
    register(caller: string, command: Command) {
        if (!validateRegistration(caller, command)) return;
        return CommandManager.registerCommand(caller, command);
    }

    /**
     * Unregisters a command
     * @param caller Caller name
     * @param commandId Command ID
     */
    unregister(caller: string, id: string) {
        if (!validateUnregistration(caller, id)) return;
        CommandManager.unregisterCommand(caller, id);
    }

    /**
     * Unregisters all commands for a specific caller
     * @param caller Name of the caller whose commands should be unregistered
     */
    unregisterAll(caller: string) {
        CommandManager.unregisterAll(caller);
    }

    /**
     * Gets all commands registered by a specific caller
     * @param caller Name of the caller whose commands should be retrieved
     * @returns Array of command objects registered by the caller
     */
    getCommandsByCaller(caller: string) {
        return CommandManager.getCommandsByCaller(caller);
    }
}

class BoundCommandAPI {
    #callerName: string;

    constructor(callerName: string) {
        this.#callerName = callerName;
    }

    Types = Types;

    /**
     * Registers a new command
     * @param command Command object
     * @returns Unregister function
     */
    register(command: Command) {
        if (!validateRegistration(this.#callerName, command)) return;
        return CommandManager.registerCommand(this.#callerName, command);
    }

    /**
     * Unregisters a command
     * @param commandId Command ID
     */
    unregister(commandId: string) {
        if (!validateUnregistration(this.#callerName, commandId)) return;
        CommandManager.unregisterCommand(this.#callerName, commandId);
    }

    /**
     * Unregisters all commands made by this bound api
     */
    unregisterAll() {
        CommandManager.unregisterAll(this.#callerName);
    }

    /**
     * Gets all commands registered by this bound api
     * @returns Array of command objects registered by the caller
     */
    getCommandsByCaller() {
        return CommandManager.getCommandsByCaller(this.#callerName);
    }
}

Object.freeze(CommandAPI);
Object.freeze(CommandAPI.prototype);
Object.freeze(CommandAPI.prototype.Types);
Object.freeze(CommandAPI.constructor);

export {CommandAPI, BoundCommandAPI};