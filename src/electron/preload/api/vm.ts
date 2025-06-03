import vm from "vm";

export function compileFunction(code: string, params: string[] = [], options = {}) {
    try {
        return vm.compileFunction(code, params, options);
    }
    catch (e) {
        const error: Error = e as Error;
        return {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
    }
}