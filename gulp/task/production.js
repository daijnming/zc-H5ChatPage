var gulp = require('gulp');
var sequence = require('gulp-sequence');

gulp.task('production',sequence('useref','rev','replace'));
