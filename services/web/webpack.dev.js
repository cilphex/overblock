import merge from 'webpack-merge';
import common from './webpack.common.js';
import path from "path";

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',

  // This tells the webpack-dev-server what files are needed to be served.
  // Everything from our src folder needs to be served (outputted) in the
  // browser
  devServer: {
    contentBase: path.join(__dirname, 'src'),
    historyApiFallback: true,
  },
});