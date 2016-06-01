var gulp = require('gulp');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');

gulp.task('test',function(){
	return gulp.src('./wap/**/*.js').
	pipe(uglify()).
	on("error",notify.onError({
	    "message":"Error: <%= error.message %>"
	}));
});
