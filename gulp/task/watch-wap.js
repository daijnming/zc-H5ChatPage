var gulp = require('gulp');
var watch = require('gulp-watch');
gulp.task('watch-wap',['browserify'],function(){
	watch('./wap/js/**/*.js',function(){
		gulp.start('browserify-wap');
	});
});
