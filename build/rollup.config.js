'use strict'

const path    = require('path')
const babel   = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const pkg     = require(path.resolve(__dirname, '../package.json'))
const year    = new Date().getFullYear()

const external  = ['jquery', 'popper.js']
const plugins = [
  babel({
    exclude: 'node_modules/**', // only transpile our source code
    externalHelpersWhitelist: [ // include only required helpers
      'defineProperties',
      'createClass',
      'inheritsLoose'
    ],
    plugins: ['external-helpers']
  })
]
const globals = {
  jquery: '$',
  'popper.js': 'Popper'
}

module.exports = {
  input: path.resolve(__dirname, '../js/src/index.js'),
  format: 'iife',
  name: 'bootstrap',
  external,
  globals,
  plugins,
  banner: `/*!
  * Bootstrap v${pkg.bootstrapVersion} (${pkg.homepage})
  * Copyright 2011-${year} The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
  */`
}
