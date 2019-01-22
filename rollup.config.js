const browsersync = require('rollup-plugin-browsersync')
const postcss = require('rollup-plugin-postcss')
const postcssNormalize = require('postcss-normalize')
const autoprefixer = require('autoprefixer')
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
    (isDevelopment && filesize()),
    (isProduction && terser()),
    postcss({
      plugins: [
        postcssNormalize(),
        autoprefixer()
      ],
      extract: true
    }),
    (isDevelopment && browsersync({server: 'public'}))
  ]
};
