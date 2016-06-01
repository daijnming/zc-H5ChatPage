/**
 * @author Treagzhao
 */
var gulp = require("gulp");
var useref = require("gulp-useref");
var gulpIf = require("gulp-if");
var uglify = require('gulp-uglify');
var minifyCss = require("gulp-minify-css");
var autoPrefixed = require("gulp-autoprefixer");
var notify = require('gulp-notify');
var removeLog = require('gulp-removelogs');

gulp.task('useref',['browserify','imagemin'], function() {
   return gulp.src('wap/index.html').
    pipe(useref()).
    //pipe(gulpIf("*.css",minifyCss())).
    pipe(gulpIf("*.css",autoPrefixed())).
    pipe(gulpIf("*.js",uglify())).
  //`  pipe(gulpIf("*.js",removeLog())).
    on("error",notify.onError({
		"message":"Error: <%= error.message %>"
	})).
    pipe(gulp.dest('./dest/'));
});
