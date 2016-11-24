var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var cleanCss = require('gulp-clean-css');

gulp.task('uglify-concat', function(){
  gulp.src('./js/*.js')
    .pipe(uglify({'mangle': false}))
    .pipe(concat('project5.min.js'))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('minify-css', function(){
  gulp.src('./css/*.css')
    .pipe(cleanCss())
    .pipe(concat('project5.min.css'))
    .pipe(gulp.dest('./dist/css/'));
});

gulp.task('copy', function(){
  gulp.src('*.html')
    .pipe(gulp.dest('./dist/'));
  gulp.src('./js/libs/*.js')
    .pipe(gulp.dest('./dist/js/libs/'));
  gulp.src('./images/*.*')
    .pipe(gulp.dest('./dist/images/*.*'));
});

gulp.task('default', ['uglify-concat', 'minify-css', 'copy']);
