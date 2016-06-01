var gulp = require('gulp');
var rev = require("gulp-rev");
var htmlMin = require('gulp-htmlmin');
var gulpIf = require("gulp-if");
var removeLog = require('gulp-removelogs');
gulp.task('move-html',function(){
	return gulp.src('./dest/**/*.html').
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
	pipe(gulp.dest('./dist'));
});
gulp.task('rev',['move-html'],function(){
	return gulp.src(['./dest/**/*.js','./dest/**/*.css','./dest/**/*.png','./dest/**/*.jpeg','./dest/**/*.jpg','./dest/**/*.gif','./dest/**/*.mp3']).
	pipe(rev()).
	//ipipe(gulpIf("*.js",removeLog())).
	pipe(gulp.dest('./dist')).
	pipe(rev.manifest()).
	pipe(gulp.dest('./'));

});
