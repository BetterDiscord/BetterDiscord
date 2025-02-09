import {clone, getKeys} from "@common/utils";

export default clone(process, {}, getKeys(process).filter(p => p !== "config"));