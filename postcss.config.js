module.exports = ctx => {
    return {
        map: false,
        plugins: {
            "postcss-easy-import": {},
            "postcss-csso": ctx.env === "production" ? {restructure: false} : false
        }
    };
};