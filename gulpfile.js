const gulp = require("gulp");
const rename = require("gulp-rename");
const csso = require("gulp-csso");

gulp.task("minify-css", minifyCSS);
gulp.task("watch-css", function() {
  return gulp.watch(["./src/styles/index.css"], minifyCSS);
});

function minifyCSS() {
  return gulp.src("./src/styles/index.css")
        .pipe(csso({restructure: false}))
        .pipe(rename("style.css"))
        .pipe(gulp.dest("./dist"));
}