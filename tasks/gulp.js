const gulp          = require('gulp');
const plumber       = require('gulp-plumber');
const path          = require('path');
const sequence      = require('gulp-sequence');
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

    createJsTasks: false,
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
  },

  'registerTasks': function (gulp, config) {
    // Main Tasks
    const buildTasks = [config.tasksNamePrefix + 'build:css'];
    const cleanTasks = [config.tasksNamePrefix + 'clean:css'];
    if (config.createJsTasks) {
      buildTasks.push(config.tasksNamePrefix + 'build:js');
      cleanTasks.push(config.tasksNamePrefix + 'clean:js');
    }
    gulp.task(config.tasksNamePrefix + 'build', function (callback) { sequence(buildTasks)(callback); });
    gulp.task(config.tasksNamePrefix + 'clean', function (callback) { sequence(cleanTasks)(callback); });

    // CSS Tasks
    gulp.task(config.tasksNamePrefix + 'build:css', function (callback) {
      sequence(config.tasksNamePrefix + 'build:css-ltr', config.tasksNamePrefix + 'build:css-rtl')(callback);
    });
    gulp.task(config.tasksNamePrefix + 'build:css-ltr', _.bind(this['build:css-ltr'], {}, config));
    gulp.task(config.tasksNamePrefix + 'build:css-rtl', _.bind(this['build:css-rtl'], {}, config));
    gulp.task(config.tasksNamePrefix + 'clean:css', _.bind(this['clean:css'], {}, config));

    // JS Tasks
    if (config.createJsTasks) {
      gulp.task(config.tasksNamePrefix + 'build:js', function (callback) {
        sequence(config.tasksNamePrefix + 'build:js-ltr')(callback);
      });
      gulp.task(config.tasksNamePrefix + 'build:js-ltr', _.bind(this['build:js-ltr'], {}, _, config));
      gulp.task(config.tasksNamePrefix + 'clean:js', _.bind(this['clean:js'], {}, config));
    }
  },

  'build': function (config) {
    const tasks = [config.tasksNamePrefix + 'build:css'];
    if (config.createJsTasks) {
      tasks.push(config.tasksNamePrefix + 'build:js');
    }

    sequence(tasks);
  },
  'clean': function (config) {
    const tasks = [config.tasksNamePrefix + 'clean:css'];
    if (config.createJsTasks) {
      tasks.push(config.tasksNamePrefix + 'clean:js');
    }

    sequence(tasks);
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
    return del([config.cssDist + '/*']);
  },

  'build:js-ltr': function (callback, config) {
    return gulp.src(path.resolve(__dirname, '..') + '/**/*.js')
      .pipe(plumber())
      .pipe(rollup(config.rollupConfig))
      .pipe(rename({
        dirname: config.jsDist,
        basename: "bootstrap",
      }))
      .pipe(gulp.dest('.'))
      .pipe(rename({ suffix: '.min' }))
      .pipe(uglify(config.uglifyConfig))
      .pipe(gulp.dest('.'))
  },
  'clean:js': function (config) {
    return del([config.jsDist + '/*']);
  }
};
