var gulp = require('gulp');
var sequence = require('gulp-sequence');
var minimist = require("minimist");
var options = minimist(process.argv.slice(2));
gulp.task('production-wap',sequence('useref-wap','rev-wap','replace-wap'));
