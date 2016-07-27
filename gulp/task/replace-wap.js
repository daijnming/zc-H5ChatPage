var gulp = require('gulp');
var replace = require('gulp-rev-replace');
var minimist = require("minimist");
var options = minimist(process.argv.slice(2));
if(!options.d){
	options.d = "wap";
}
var targetDir = options.d.replace(/\//g,'');
console.log(options);
gulp.task('replace-wap',function(){
	var man = gulp.src('./wap/rev-manifest.json');
	return gulp.src(['./dist/'+targetDir+'/**/*.html','./dist/'+targetDir+'/**/*.css']).
	pipe(replace({
	    'manifest':man
	})).
	pipe(gulp.dest('./dist/'+targetDir));
});
