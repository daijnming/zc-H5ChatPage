var gulp = require("gulp");
var browserify = require('gulp-browserify');
var notify = require('gulp-notify');
gulp.task('browserify-wap',function(){
return	gulp.src(['./wap/js/entrance.js']).
	pipe(browserify({
		'insertGlobals':false
	})).
	on("error",notify.onError({
		"message":"Error: <%= error.message %>"
	})).
	pipe(gulp.dest('./dest/wap/js'));
});
