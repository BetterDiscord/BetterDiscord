import cloneObject, {getKeys} from "common/clone";

export default cloneObject(process, {}, getKeys(process).filter(p => p !== "config"));