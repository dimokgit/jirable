// Node modules
var fs = require('fs'), vm = require('vm'), merge = require('deeply'), chalk = require('chalk'), es = require('event-stream');

// Gulp and plugins
var gulp = require('gulp'), clean = require('gulp-clean');
var dist = "./lib/";

// Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task('js', function () {
  return gulp.src([
    './src/app/jira-settings.js',
    './src/app/startup.js'
  ])
        .pipe(gulp.dest(dist));
});

gulp.task('comps', function () {
  return gulp.src([
    './src/components/**/*'
  ])
        .pipe(gulp.dest(dist+"/components/"));
});

gulp.task('images', function () {
  return gulp.src(['./src/images/*'])
        .pipe(gulp.dest(dist + "images/"));
});

// Removes all files from ./dist/
gulp.task('clean', function() {
    return gulp.src(dist+'**/*', { read: false })
        .pipe(clean());
});

gulp.task('default', ['js', 'images','comps'], function(callback) {
    callback();
    console.log('\nPlaced optimized files in ' + chalk.magenta('dist/\n'));
});
