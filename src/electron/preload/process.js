import {clone, getKeys} from "@common/utils";

const newProcess = clone(process, {}, getKeys(process).filter(p => p !== "config"));

// Monaco will break if process..versions.node exists
delete newProcess.versions.node;

export default newProcess;