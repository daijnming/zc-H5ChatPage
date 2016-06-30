var gulp = require('gulp');
var sequence = require('gulp-sequence');

gulp.task('production-wap',sequence('useref-wap','rev-wap','replace-wap'));
