import {clone, getKeys} from "@common/utils";


// TODO: make typescript not awful
const newProcess: typeof process & {isWeb?: boolean;} = clone(process as unknown as Record<string | number | symbol, unknown>, {}, getKeys(process as unknown as Record<string | number | symbol, unknown>).filter(p => p !== "config")) as unknown as typeof process;

// Monaco will break if process.versions.node exists
newProcess.versions.nodejs = newProcess.versions.node;
// @ts-expect-error necessary evil
delete newProcess.versions.node;
newProcess.isWeb = true;

export default newProcess;