const spawn = require('child_process').spawn;
const gulp = require('gulp');
const babel = require('gulp-babel');
const css = require('gulp-css');

var buildHtml = function () {
    return gulp.src('src/index.html')
        .pipe(gulp.dest('app/'));
}

var buildCss = function () {
    return gulp.src('src/**/*.css')
        .pipe(css())
        .pipe(gulp.dest('app/'));
}

var buildJs = function js() {
    return gulp.src(['main.js', 'src/**/*.js'])
         .pipe(babel())
         .pipe(gulp.dest('app/'));
}

var start = function () {
    spawn(
        'node_modules/.bin/electron', 
        ['.'], 
        { stdio: 'inherit' }
    ).on('close', () => process.exit());
}

var release = function () {
   spawn(
        'node_modules/.bin/electron-builder',
        ['.'],
        { stdio: 'inherit' }
    ).on('close', () => process.exit());
}

// Gether resources
gulp.task('html', buildHtml);
gulp.task('css', buildCss);
gulp.task('js', buildJs);

gulp.task('start', gulp.series(['html', 'css', 'js'], start));
//gulp.task('release', gulp.series(['copy', 'build'], release));
//gulp.task('release', release);
