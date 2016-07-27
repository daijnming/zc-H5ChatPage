var gulp = require('gulp');
var rev = require("gulp-rev");
var htmlMin = require('gulp-htmlmin');
var gulpIf = require("gulp-if");
var removeLog = require('gulp-removelogs');
var minimist = require("minimist");
var options = minimist(process.argv.slice(2));
if(!options.d){
	options.d = "wap";
}
var targetDir = options.d;
gulp.task('move-html-wap',function(){
	return gulp.src('./dest/wap/**/*.html').
	pipe(htmlMin({
	    removeComments: true,
            removeCommentsFromCDATA: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: false,
            removeAttributeQuotes: false,
            removeRedundantAttributes: true,
            //useShortDoctype: true,
            removeEmptyAttributes: false,
            removeOptionalTags: false
        })).
	pipe(gulp.dest('./dist/'+targetDir));
});
gulp.task('rev-wap',['move-html-wap'],function(){
	return gulp.src(['./dest/wap/**/*.js','./dest/wap/**/*.css','./dest/wap/**/*.png','./dest/wap/**/*.jpeg','./dest/wap/**/*.jpg','./dest/wap/**/*.gif','./dest/wap/**/*.mp3']).
	pipe(rev()).
	//ipipe(gulpIf("*.js",removeLog())).
	pipe(gulp.dest('./dist/'+targetDir)).
	pipe(rev.manifest()).
	pipe(gulp.dest('./wap'));

});
