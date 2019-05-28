const gulp = require("gulp");
const rename = require("gulp-rename");
const minify = require("gulp-babel-minify");
const csso = require("gulp-csso");

gulp.task("minify-js", minifyJS);
gulp.task("minify-css", minifyCSS);

gulp.task("watch-js", function() {
  return gulp.watch(["./js/main.js"], minifyJS);
});

gulp.task("watch-css", function() {
  return gulp.watch(["./css/main.css"], minifyCSS);
});

gulp.task("watch", function() {
  return gulp.watch(["./js/main.js", "./css/main.css"], gulp.series(minifyJS, minifyCSS));
});

function minifyJS() {
  return gulp.src("./js/main.js")
  .pipe(minify({mangle: {keepClassName: true}}))
  .pipe(rename("main.min.js"))
  .pipe(gulp.dest("./js"));
}

function minifyCSS() {
  return gulp.src("./css/main.css")
        .pipe(csso({restructure: false}))
        .pipe(rename("main.min.css"))
        .pipe(gulp.dest("./css"));
}