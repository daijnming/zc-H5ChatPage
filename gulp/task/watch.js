var gulp = require('gulp');
var watch = require('gulp-watch');
gulp.task('watch',['browserify'],function(){
	watch('./wap/js/**/*.js',function(){
		gulp.start('browserify');
	});
});
