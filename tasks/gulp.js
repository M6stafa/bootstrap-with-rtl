const gulp          = require('gulp');
const path          = require('path');
const sequence      = require('run-sequence')
const del           = require('del');
const sass          = require('gulp-sass');
const postcss       = require('gulp-postcss');
const autoprefixer  = require('autoprefixer');
const removeComment = require('postcss-discard-comments');
const sourcemaps    = require('gulp-sourcemaps');
const rename        = require('gulp-rename');
const cleancss      = require('gulp-clean-css');
const rtlcss        = require('gulp-rtlcss');
const rollup        = require('gulp-rollup');
const uglify        = require('gulp-uglify');
const _             = require('lodash');


module.exports = {
  'config': {
    tasksNamePrefix: '',

    scssInput: path.resolve(__dirname, '../scss/bootstrap.scss'),
    cssDist: path.resolve(__dirname, '../dist/css'),
    sassOptions: {
      outputStyle: 'expanded',
      precision: 6
    },
    cssCleanRegex: [path.resolve(__dirname, '../dist/css') + '/*'],

    rollupConfig: require(path.resolve(__dirname, '../build/rollup.config')),
    jsDist: path.resolve(__dirname, '../dist/js'),
    uglifyConfig: {
      compress: {
        typeofs: false
      },
      output: {
        comments: '/^!/'
      }
    },
    jsCleanRegex: [path.resolve(__dirname, '../dist/js') + '/*'],
  },

  'registerTasks': function (gulp, config) {
    gulp.task(config.tasksNamePrefix + 'build', _.bind(this['build'], {}, config));
    gulp.task(config.tasksNamePrefix + 'clean', _.bind(this['clean'], {}, config));

    gulp.task(config.tasksNamePrefix + 'build:css', _.bind(this['build:css'], {}, config));
    gulp.task(config.tasksNamePrefix + 'build:css-ltr', _.bind(this['build:css-ltr'], {}, config));
    gulp.task(config.tasksNamePrefix + 'build:css-rtl', _.bind(this['build:css-rtl'], {}, config));
    gulp.task(config.tasksNamePrefix + 'clean:css', _.bind(this['clean:css'], {}, config));

    gulp.task(config.tasksNamePrefix + 'build:js', _.bind(this['build:js'], {}, config));
    gulp.task(config.tasksNamePrefix + 'build:js-ltr', _.bind(this['build:js-ltr'], {}, config));
    gulp.task(config.tasksNamePrefix + 'clean:js', _.bind(this['clean:js'], {}, config));
  },

  'build': function (config) {
    sequence([config.tasksNamePrefix + 'build:css', config.tasksNamePrefix + 'build:js']);
  },
  'clean': function (config) {
    sequence([config.tasksNamePrefix + 'clean:css', config.tasksNamePrefix + 'clean:js']);
  },

  'build:css': function (config) {
    sequence(config.tasksNamePrefix + 'clean:css', config.tasksNamePrefix + 'build:css-ltr', config.tasksNamePrefix + 'build:css-rtl');
  },
  'build:css-ltr': function (config) {
    return gulp.src(config.scssInput)
      .pipe(sass(config.sassOptions).on('error', sass.logError))
      .pipe(postcss([removeComment(), autoprefixer()]))
      .pipe(gulp.dest(config.cssDist))
      .pipe(rename({ suffix: '.min' }))
      .pipe(cleancss({ level: 1 }))
      .pipe(gulp.dest(config.cssDist));
  },
  'build:css-rtl': function (config) {
    return gulp.src(config.scssInput)
      .pipe(sass(config.sassOptions).on('error', sass.logError))
      .pipe(postcss([autoprefixer()]))
      .pipe(rename({ suffix: '.rtl' }))
      .pipe(rtlcss())
      .pipe(gulp.dest(config.cssDist))
      .pipe(rename({ suffix: '.min' }))
      .pipe(cleancss({
        level: 1
      }))
      .pipe(gulp.dest(config.cssDist));
  },
  'clean:css': function (config) {
    return del(config.cssCleanRegex);
  },

  'build:js': function (config) {
    sequence(config.tasksNamePrefix + 'clean:js', config.tasksNamePrefix + 'build:js-ltr');
  },
  'build:js-ltr': function (config) {
    return gulp.src(path.resolve(__dirname, '..') + '/**/*.js')
      .pipe(rollup(config.rollupConfig))
      .pipe(rename({
        dirname: config.jsDist,
        basename: "bootstrap",
      }))
      .pipe(gulp.dest('.'))
      .pipe(rename({ suffix: '.min' }))
      .pipe(uglify(config.uglifyConfig))
      .pipe(gulp.dest('.'));
  },
  'clean:js': function (config) {
    return del(config.jsCleanRegex);
  }
};
