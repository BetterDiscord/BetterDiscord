import vm from "vm";

export function compileFunction(code, params = [], options = {}) {
    try {
        return vm.compileFunction(code, params, options);
    }
    catch (error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
    }
}