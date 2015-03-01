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


// move
gulp.task('move', function() {
    return gulp.src(
        ['js/**/*jquery*js', 'js/**/*bootstrap*js', 'images/**/*', 'css/**/*bootstrap*css'], {
            base: './'
        }
    ).pipe(gulp.dest('public'));
});


//usemin
gulp.task('usemin', function() {
    return gulp.src('index.html')
        .pipe(
            usemin({
                //rev() 文件带hash  'concat' 文件没有hash
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


//manifest
gulp.task('manifest', ['move', 'usemin'], function() {
    gulp.src(['public/**/*', '!public/index.html'])
        .pipe(
            manifest({
                hash: true,
                preferOnline: true,
                network: ['http://*', 'https://*', '*'],
                filename: 'app.manifest',
                exclude: 'app.manifest'
            })
        ).pipe(gulp.dest('public'));
});

// Clean
gulp.task('clean', function(cb) {
    del(['public'], cb)
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
    gulp.start('manifest');
});
