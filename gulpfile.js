const gulp = require('gulp');

const tasks = require('./tasks/gulp');
tasks.config.createJsTasks = true;
tasks.registerTasks(gulp, tasks.config);
