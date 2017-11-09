const gulp = require('gulp');

const tasks = require('./tasks/gulp');
tasks.registerTasks(gulp, tasks.config);
