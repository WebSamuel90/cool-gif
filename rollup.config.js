const browsersync = require('rollup-plugin-browsersync')
const postcss = require('rollup-plugin-postcss')
const postcssNormalize = require('postcss-normalize')


const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = isProduction === false;

module.exports = {
  input: 'src/scripts/index.js',
  output: {
    file: 'public/giphy.js',
    format: 'iife'
  },
  plugins: [
    postcss({
      plugins: [
        postcssNormalize()
      ],
      extract: true
    }),
    (isDevelopment && browsersync({server: 'public'}))
  ]
};
