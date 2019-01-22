const browsersync = require('rollup-plugin-browsersync')
const postcss = require('rollup-plugin-postcss')
const postcssNormalize = require('postcss-normalize')
const autoprefixer = require('autoprefixer')
const cssNano = require('cssnano')
const babel = require('rollup-plugin-babel')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonJs = require('rollup-plugin-commonjs')
const {terser} = require('rollup-plugin-terser')
const filesize = require('rollup-plugin-filesize')

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = isProduction === false;

module.exports = {
  input: 'src/scripts/index.js',
  output: {
    file: 'public/giphy.js',
    format: 'iife'
  },
  plugins: [
    babel(),
    nodeResolve(),
    commonJs(),
    postcss({
      plugins: [
        postcssNormalize(),
        autoprefixer(),
        cssNAno()
      ],
      extract: true
    }),
    (isDevelopment && filesize()),
    (isProduction && terser()),
    (isDevelopment && browsersync({server: 'public'}))
  ]
};
