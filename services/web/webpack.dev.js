import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import path from 'path';

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map',

  // This tells the webpack-dev-server what files are needed to be served.
  // Everything from our src folder needs to be served (outputted) in the
  // browser
  devServer: {
    contentBase: path.join(__dirname, 'src'),
    historyApiFallback: true,
    proxy: {
      // NOTE: Would proxy /heartbeat here as well, but there
      // seems to be some type of bug here where queries to
      // /globals will return with 'beating' when /heartbeat is
      // also proxied. It's like they get mixed up. /heartbeat
      // isn't actually needed, so just keep it absent.
      //
      // Even this as-is causes errors in the dev server console
      // logs when /globals is hit, but I haven't been able to
      // find a solution.
      '/globals': {
        bypass: (req, res) => {
          res.json({
            // See package.json for this value
            LND_GATEWAY_HOST: process.env.LND_GATEWAY_HOST
          });
        }
      }
    }
  },
});