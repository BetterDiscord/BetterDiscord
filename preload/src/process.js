import cloneObject, {getKeys} from "common/clone";

const newProcess = cloneObject(process, {}, getKeys(process).filter(p => p !== "config"));

// Monaco will break if process.versions.node exists
newProcess.versions.nodejs = newProcess.versions.node;
delete newProcess.versions.node;
newProcess.isWeb = true;

export default newProcess;