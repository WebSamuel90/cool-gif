import browsersync from 'rollup-plugin-browsersync'
import postcss from 'rollup-plugin-postcss'
import postcssNormalize from 'postcss-normalize'
import autoprefixer from 'autoprefixer'
import cssNano from 'cssnano'
import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonJs from 'rollup-plugin-commonjs'
import {terser} from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'
import injectEnv from 'rollup-plugin-inject-env';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = isProduction === false;

module.exports = {
  input: 'src/scripts/index.js',
  output: {
    file: 'public/giphy.js',
    format: 'iife',
    sourcemap: isDevelopment
  },
  plugins: [
    babel(),
    nodeResolve(),
    commonJs(),
    injectEnv(),
    postcss({
      plugins: [
        postcssNormalize(),
        autoprefixer(),
        (isDevelopment && cssNano())
      ].filter(Boolean),
      extract: true
    }),
    (isDevelopment && filesize()),
    (isProduction && terser()),
    (isDevelopment && browsersync({server: 'public'}))
  ]
};
