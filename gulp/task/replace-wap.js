var gulp = require('gulp');
var replace = require('gulp-rev-replace');

gulp.task('replace-wap',function(){
	var man = gulp.src('./wap/rev-manifest.json');
	return gulp.src(['./dist/wap/**/*.html','./dist/wap/**/*.css']).
	pipe(replace({
	    'manifest':man
	})).
	pipe(gulp.dest('./dist/wap'));
});
