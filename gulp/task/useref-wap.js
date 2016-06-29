var gulp = require("gulp");
var uglify = require("gulp-uglify");
var useref = require("gulp-useref");
var notify = require('gulp-notify');
var gulpIf = require("gulp-if");
var cleanCSS = require('gulp-clean-css');

var autoPrefixed = require("gulp-autoprefixer");
gulp.task("useref-wap",['browserify-wap','imagemin-wap'],function(){
	return gulp.src("wap/**/*.html").
	pipe(useref()).
	pipe(gulpIf("*.css",cleanCSS({
		'compatibility':"ie8"
	}))).
	on("error",notify.onError({
		"message":"Error: <%= error.message %>"
	})).
	pipe(gulpIf("*.js",uglify())).
	on("error",notify.onError({
		"message":"Error: <%= error.message %>"
	})).
	pipe(gulp.dest('./dest/wap'));
});
