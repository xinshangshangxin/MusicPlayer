var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    del = require('del'),
    rev = require('gulp-rev'),
    minifyhtml = require('gulp-minify-html'),
    inject = require('gulp-inject'),
    manifest = require('gulp-manifest');


// move
gulp.task('move', function() {
    return gulp.src(
        ['js/**/*jquery*js', 'js/**/*bootstrap*js', 'images/**/*', 'css/**/*bootstrap*css', 'index.html'], {
            base: './'
        }
    ).pipe(gulp.dest('dist'));
});

// js
gulp.task('js', function() {
    return gulp.src(['js/**/*', '!js/**/*jquery*js', '!js/**/*bootstrap*js'])
        .pipe(concat('user.js'))
        .pipe(uglify({
            compress: {
                drop_console: true
            }
        }))
        .pipe(rev())
        .pipe(gulp.dest('dist/js'));
});

// css
gulp.task('css', function() {
    return gulp.src(['css/**/*', '!css/**/*bootstrap*css'])
        .pipe(concat('user.css'))
        .pipe(minifycss())
        .pipe(rev())
        .pipe(gulp.dest('dist/css'));
});

// index.html
gulp.task('index', ['move', 'js', 'css'], function() {
    var sources = gulp.src(['dist/js/**/*.js', '!dist/js/**/*jquery*js', '!dist/js/**/*bootstrap*js', 'dist/css/**/*.css', '!dist/css/**/*bootstrap*css'], {
        read: false
    });
    return gulp.src('dist/index.html')
        .pipe(inject(sources, {
            relative: true
        }))
        .pipe(minifyhtml())
        .pipe(gulp.dest('dist'));
});


//manifest
gulp.task('manifest', ['index'], function() {
    gulp.src(['dist/**/*', '!dist/index.html'])
        .pipe(
            manifest({
                hash: true,
                preferOnline: true,
                network: ['http://*', 'https://*', '*'],
                filename: 'app.manifest',
                exclude: ['app.manifest', 'CNAME']
            })
        ).pipe(gulp.dest('dist'));
});

// Clean
gulp.task('clean', function(cb) {
    del(['dist/**/*', '!dist/CNAME'], cb);
});


// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('manifest');
});
