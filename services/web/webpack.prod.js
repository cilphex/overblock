import merge from 'webpack-merge';
import common from './webpack.common.js';

module.exports = merge(common, {
  mode: 'production',
  // devtool: 'source-map', // Do i want this in prod?
});