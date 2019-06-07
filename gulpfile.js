const gulp = require("gulp");
const rename = require("gulp-rename");
const csso = require("gulp-csso");

gulp.task("minify-css", minifyCSS);

gulp.task("watch-css", function() {
  return gulp.watch(["./css/main.css"], minifyCSS);
});

function minifyCSS() {
  return gulp.src("./css/main.css")
        .pipe(csso({restructure: false}))
        .pipe(rename("main.min.css"))
        .pipe(gulp.dest("./css"));
}