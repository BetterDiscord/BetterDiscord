const gulp = require("gulp");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");

const postcssImport = require("postcss-easy-import");
const postcssCSSO = require("postcss-csso");

gulp.task("build-css", buildCSS);
gulp.task("minify-css", minifyCSS);

gulp.task("watch-css", function() {
  return gulp.watch(["./src/styles/*.css", "./src/styles/**/*.css"], minifyCSS);
});

function runBuild(minified) {
  const plugins = [postcssImport];
  if (minified) plugins.push(postcssCSSO({restructure: false}));
  return gulp.src("./src/styles/index.css")
        .pipe(postcss(plugins))
        .pipe(rename("style.css"))
        .pipe(gulp.dest("./dist"));
}

function buildCSS() {
  return runBuild(false);
}

function minifyCSS() {
  return runBuild(true);
}