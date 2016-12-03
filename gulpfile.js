var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-cssmin');
var cleanCss = require('gulp-clean-css');

gulp.task('uglify', function(){
  gulp.src('./js/*.js')
    .pipe(uglify().on('error', function(e){console.log(e);}))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('minify-css', function(){
  gulp.src('./css/*.css')
    .pipe(cleanCss())
    .pipe(cssmin().on('error', function(e){console.log(e);}))
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('copy', function(){
  gulp.src('*.html')
    .pipe(gulp.dest('./dist/'));
  gulp.src('./js/libs/*.js')
    .pipe(gulp.dest('./dist/js/libs/'));
  gulp.src('./css/libs/*.css')
    .pipe(gulp.dest('./dist/css/libs/'));
  gulp.src('./images/*.*')
    .pipe(gulp.dest('./dist/images/*.*'));
});

gulp.task('default', ['uglify', 'minify-css', 'copy']);
