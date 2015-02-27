var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    rev = require('gulp-rev'),
    usemin = require('gulp-usemin'),
    changed = require('gulp-changed'),
    minifyhtml = require('gulp-minify-html'),
    manifest = require('gulp-manifest');


// Styles
gulp.task('css', function() {
    return gulp.src(['css/**/*css', '!css/**/*bootstrap*css'])
        .pipe(
            rename('user.min.css')
        )
        .pipe(gulp.dest('public/css'));
});

// Scripts
gulp.task('js', function() {
    return gulp.src(['js/**/*.js', '!js/**/*jquery*js', '!js/**/*bootstrap*js'])
        .pipe(concat('user.min.js'))
        .pipe(gulp.dest('public/js'));
});

//movejs
gulp.task('movejs', function() {
    return gulp.src(['js/**/*jquery*js', 'js/**/*bootstrap*js'])
        .pipe(changed('public'))
        .pipe(gulp.dest('public/js'));
});

//moveimages
gulp.task('moveimages', function() {
    return gulp.src(['images/**/*'])
        .pipe(changed('public'))
        .pipe(gulp.dest('public/images'));
});

//movecss
gulp.task('movecss', function() {
    return gulp.src(['css/**/*bootstrap*css'])
        .pipe(changed('public'))
        .pipe(gulp.dest('public/css'));
});


//usemin
gulp.task('usemin', ['css', 'js', 'movecss', 'movejs', 'moveimages'], function() {
    return gulp.src('index.html')
        .pipe(
            usemin({
                //rev() 文件带hash  'concat' 文件名没有hash
                css: [minifycss(), rev()],
                html: [minifyhtml({
                    empty: true
                })],
                js: [uglify(), rev()]
            })
        )
        .pipe(
            gulp.dest('public/')
        );
});

// Clean
gulp.task('clean', function(cb) {
    del(['public'], cb)
});

//manifest
gulp.task('manifest', ['css', 'js', 'movecss', 'movejs', 'moveimages', 'usemin'], function() {
    gulp.src(['public/**/*', '!public/index.html'])
        .pipe(manifest({
            hash: true,
            preferOnline: true,
            network: ['http://*', 'https://*', '*'],
            filename: 'app.manifest',
            exclude: 'app.manifest'
        }))
        .pipe(gulp.dest('public'));
});


// // Watch
// gulp.task('watch', function() {
//     // Watch .scss files
//     gulp.watch('css/**/*', ['css']);
//     // Watch .js files
//     gulp.watch('js/**/*.js', ['js']);
//     // Create LiveReload server
//     livereload.listen();
//     // Watch any files in dist/, reload on change
//     gulp.watch(['public/**']).on('change', livereload.changed);
// });


// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('css', 'js', 'movecss', 'movejs', 'moveimages', 'usemin', 'manifest');
});
