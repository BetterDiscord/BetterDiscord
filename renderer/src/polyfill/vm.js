export const compileFunction = function (code, params = [], filename = "") {
    return window.eval(`(${params.join(", ")}) => {${code}//# sourceURL=${filename.replace(/\\/g, "\\")}\n}`); // eslint-disable-line no-eval
};