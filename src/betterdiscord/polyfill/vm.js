import Remote from "./remote";


export const compileFunction = function(code, params = [], options = {}) {
    const returned = Remote.vm.compileFunction(code, params, options);
    if (typeof (returned) === "function") return returned;
    const syntaxError = new SyntaxError(returned.message);
    syntaxError.stack = returned.stack;
    throw syntaxError;
};

export default {compileFunction};