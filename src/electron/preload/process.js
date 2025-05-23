import {clone, getKeys} from "@common/utils";

const newProcess = clone(process, {}, getKeys(process).filter(p => p !== "config"));

// Monaco will break if process.versions.node exists
newProcess.versions.nodejs = newProcess.versions.node;
delete newProcess.versions.node;
newProcess.isWeb = true;

export default newProcess;