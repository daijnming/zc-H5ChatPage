var gulp = require('gulp');
var rev = require("gulp-rev");
var htmlMin = require('gulp-htmlmin');
var gulpIf = require("gulp-if");
var removeLog = require('gulp-removelogs');
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
	pipe(gulp.dest('./dist/wap'));
});
gulp.task('rev-wap',['move-html-wap'],function(){
	return gulp.src(['./dest/wap/**/*.js','./dest/wap/**/*.css','./dest/wap/**/*.png','./dest/wap/**/*.jpeg','./dest/wap/**/*.jpg','./dest/wap/**/*.gif','./dest/wap/**/*.mp3']).
	pipe(rev()).
	//ipipe(gulpIf("*.js",removeLog())).
	pipe(gulp.dest('./dist/wap')).
	pipe(rev.manifest()).
	pipe(gulp.dest('./wap'));

});
