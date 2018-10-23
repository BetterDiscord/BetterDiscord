const gulp = require("gulp");
const rename = require("gulp-rename");
const minify = require("gulp-babel-minify");
const csso = require("gulp-csso");

gulp.task("minify-js", function() {
	return gulp.src("./js/main.js")
        .pipe(minify({mangle: {keepClassName: true}}))
        .pipe(rename("main.min.js"))
        .pipe(gulp.dest("./js"));
});

gulp.task("minify-css", function() {
	return gulp.src("./css/main.css")
        .pipe(csso({restructure: false}))
        .pipe(rename("main.min.css"))
        .pipe(gulp.dest("./css"));
});

gulp.task("watch-js", function() {
  return gulp.watch(["./js/main.js"], ["minify-js"]);
});

gulp.task("watch-css", function() {
  return gulp.watch(["./css/main.css"], ["minify-css"]);
});

gulp.task("watch", function() {
  return gulp.watch(["./js/main.js", "./css/main.css"], ["minify-js", "minify-css"]);
});