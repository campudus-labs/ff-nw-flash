var gulp = require('gulp');

var Path = require('path');
var compass = require('gulp-compass');
var minifyCss = require('gulp-minify-css');
var del = require('del');
var browserify = require('gulp-browserify');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var plumber = require('gulp-plumber');


gulp.task('sass', sassCompile);
gulp.task('assets', assetCopy);
gulp.task('scripts', scriptCompile);
gulp.task('clean', clean);

gulp.task('reloader', ['default'], reload);
gulp.task('dev', ['default'], liveReloadServer);

gulp.task('default', ['sass', 'assets', 'scripts']);


function sassCompile() {
  return gulp.src('src/main/scss/style.scss')
    .pipe(plumber({
      errorHandler : function (error) {
        console.log(error.message);
        this.emit('end');
      }
    }))
    .pipe(compass({
      project : Path.join(__dirname),
      css : 'out/css',
      sass : 'src/main/scss',
      image : 'src/main/img'
    }))
    .pipe(minifyCss())
    .pipe(gulp.dest('out/css'));
}

function scriptCompile() {
  return gulp.src(['src/main/js/app.js'])
    .pipe(plumber())
    .pipe(browserify({
//      transform : ['reactify']
    }))
    .pipe(gulp.dest('out/js/'));
}

function assetCopy() {
  return gulp.src(['src/main/**', '!src/main/js/**', '!src/main/scss', '!src/main/scss/**'])
    .pipe(gulp.dest('out/'));
}

function liveReloadServer() {
  browserSync({
    server : {
      baseDir : 'out'
    }
  });

  gulp.watch(['src/main/**', 'src/main/js/**', 'src/main/scss/**/*.scss'], {}, ['reloader']);

  //return karma.server.start({
  //  configFile : __dirname + '/karma.conf.js'
  //});
}

function clean(cb) {
  del(['out/'], cb);
}
