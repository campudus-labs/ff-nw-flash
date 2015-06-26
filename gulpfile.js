var gulp = require('gulp');

var Path = require('path');
var compass = require('gulp-compass');
var minifyCss = require('gulp-minify-css');
var del = require('del');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var plumber = require('gulp-plumber');
var replace = require('gulp-replace');
var karma = require('gulp-karma');
var shell = require('gulp-shell');
var zip = require('gulp-zip');


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
gulp.task('nw', ['build', 'flash', 'packageCopy'], packageNodeWebkit);
gulp.task('default', ['nw']);

var outDir = 'out';
var packageDir = '.';

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
      css : outDir + '/css',
      sass : 'src/main/scss',
      image : 'src/main/img'
    }))
    .pipe(minifyCss())
    .pipe(gulp.dest(outDir + '/css'));
}

function scriptCompile() {
  return browserify('src/main/js/app.js')
    .bundle()
    .on('error', function (err) {
      console.log('error occured:', err);
      this.emit('end');
    })
    .pipe(source('app.js'))
    .pipe(gulp.dest(outDir + '/js'));
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
    .pipe(gulp.dest(outDir));
}

function packageJsonCopy() {
  return gulp.src(['src/package.json'])
    .pipe(gulp.dest(outDir));
}

function devPackageCopy() {
  return gulp.src(['src/package.json'])
    .pipe(replace(/(\s*)"main"(\s*:\s*)"([^"]*)"(\s*,\s*)/,
      '$1"main"$2"http://localhost:3000/$3"$4"node-remote"$2"http://localhost:3000"$4'))
    .pipe(gulp.dest(outDir));
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
      baseDir : outDir
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

function packageNodeWebkit() {
  return gulp.src(outDir + '/**')
    .pipe(zip('xlc_shop.nw'))
    .pipe(gulp.dest(packageDir))
}

function clean(cb) {
  del([outDir], cb);
}
