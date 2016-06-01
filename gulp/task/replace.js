var gulp = require('gulp');
var replace = require('gulp-rev-replace');

gulp.task('replace',function(){
	var man = gulp.src('./rev-manifest.json');
	return gulp.src(['./dist/**/*.html','./dist/**/*.css']).
	pipe(replace({
	    'manifest':man
	})).
	pipe(gulp.dest('./dist'));
});
