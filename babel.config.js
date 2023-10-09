module.exports = (api) => {
    api.cache(false); // set cache as true/false
  
    return {
        presets: ["@babel/preset-env"],
        // optional if you want to use local .babelrc files
        babelrcRoots: [".", "injector", "preload", "renderer"],
    };
};