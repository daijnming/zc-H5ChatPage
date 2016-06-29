/**
 * @author Treagzhao
 */
 var gulp = require('gulp');
 var imagemin = require('gulp-imagemin');

 gulp.task('imagemin-wap', function() {
     return gulp.src(['./wap/images/**/*.jpeg','./wap/images/**/*.jpg','./wap/images/**/*.gif','./wap/images/**/*.png']).
     //pipe(imagemin()).
     pipe(gulp.dest('./dest/wap/images/'));
 });
