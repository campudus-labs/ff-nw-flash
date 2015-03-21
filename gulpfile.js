var gulp = require('gulp');

var Path = require('path');
var compass = require('gulp-compass');
var minifyCss = require('gulp-minify-css');
var del = require('del');
var browserify = require('gulp-browserify');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var plumber = require('gulp-plumber');
var replace = require('gulp-replace');
var karma = require('gulp-karma');
var shell = require('gulp-shell');


gulp.task('sass', sassCompile);
gulp.task('assets', assetCopy);
gulp.task('scripts', scriptCompile);
gulp.task('flash', flashCompile);
gulp.task('clean', clean);
gulp.task('packageCopy', packageJsonCopy);
gulp.task('devPackageCopy', devPackageCopy);

gulp.task('reloader', ['build'], reload);
gulp.task('reloadFlash', ['flash'], reload);
gulp.task('dev', ['devPackageCopy', 'build', 'flash'], server);
gulp.task('test', ['build', 'flash'], test);

gulp.task('build', ['sass', 'assets', 'scripts']);
gulp.task('default', ['build', 'flash', 'packageCopy']);


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

function flashCompile() {
  var flashCompileCommand;
  if (process.platform === 'darwin') {
    flashCompileCommand = 'osascript -e \'tell application "Adobe Flash CS6" to open posix file "' + __dirname + '/src/flash/compile.jsfl"\'';
  } else {
    flashCompileCommand = 'flash.exe "src\\flash\\compile.jsfl"';
  }

  return gulp.src(['src/flash/compile.jsfl'])
    .pipe(plumber())
    .pipe(shell('echo 1 > src/flash/compile.jsfl.deleteme'))
    .pipe(shell(flashCompileCommand))
}

function assetCopy() {
  return gulp.src(['src/main/**', '!src/main/js/**', '!src/main/scss', '!src/main/scss/**'])
    .pipe(gulp.dest('out/'));
}

function packageJsonCopy() {
  return gulp.src(['src/package.json'])
    .pipe(gulp.dest('out/'));
}

function devPackageCopy() {
  return gulp.src(['src/package.json'])
    .pipe(replace(/(\s*)"main"(\s*:\s*)"([^"]*)"(\s*,\s*)/,
      '$1"main"$2"http://localhost:3000/$3"$4"node-remote"$2"http://localhost:3000"$4'))
    .pipe(gulp.dest('out/'));
}

function test() {
  return gulp.src('src/test/**/*Spec.js')
    .pipe(karma({
      configFile : 'karma.conf.js',
      action : 'run'
    }))
    .on('error', function (err) {
      throw err;
    });
}

function server() {
  browserSync({
    server : {
      baseDir : 'out'
    },
    open: false
  });

  gulp.watch(['src/main/**', 'src/main/js/**', 'src/main/scss/**/*.scss'], {}, ['reloader']);
  gulp.watch(['src/flash/**'], {}, ['reloadFlash']);

  gulp.src('src/test/**/*Spec.js').pipe(karma({
    configFile : 'karma.conf.js',
    action : 'watch'
  }));
}

function clean(cb) {
  del(['out/'], cb);
}
