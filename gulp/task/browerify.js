var gulp = require("gulp");
var browserify = require('gulp-browserify');
var config = require('../config.json');
var notify = require('gulp-notify');
gulp.task('browserify',function(){
	gulp.src(config.baseDir+'js/**/entrance.js').
	pipe(browserify({
		'insertGlobals':false
	})).
	on("error",notify.onError({
		"message":"Error: <%= error.message %>"
	})).
	pipe(gulp.dest(config.baseDir+'dest/js'));
});
