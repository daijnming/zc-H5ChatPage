var gulp = require('gulp');
var watch = require('gulp-watch');
gulp.task('watch-pc',['browserify-pc'],function(){
	watch(['./pc/js/**/*.js','./common/**/*.js'],function(){
		gulp.start('browserify-pc');
	});
});
