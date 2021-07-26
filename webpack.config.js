const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const DIST = path.resolve(__dirname, 'dist')

// module.exports = {
  // devtool: 'eval-source-map',//1
  // mode: 'development',//1
  // entry: './src/index.js',//1
  // output: {//1
    // filename: 'bundle.js',
    // path: DIST,
    // publicPath: DIST,
  // },
//   devServer: {//   11
//     contentBase: DIST,
//     port: 9011,
//     writeToDisk: true,
//   },
//   plugins: [
//     new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
//     new CopyPlugin({
//       patterns: [
//         {
//           flatten: true,
//           from: './src/*',
//           globOptions: {
//             ignore: ['**/*.js'],
//           },
//         },
//       ],
//     }),
//   ],
// }

const webpack = require('webpack');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    resolve: { 
      fallback: { 
        stream: require.resolve('stream-browserify') ,
      }
     },
    // devtool: false,
    devtool: 'eval-source-map',
    entry: './src/index.js',
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
        new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
        new CopyPlugin({
          patterns: [
            {
              flatten: true,
              from: './src/*',
              // globOptions: {
              //   ignore: ['**/*.js'],
              // },
            },
          ],
        }),
    ],
    output: {
        library: {
            name: 'playground',
            type: 'window',
            export: 'playground',
        },
        filename: 'bundle.js',
        path: DIST,
        // publicPath: DIST,
    },
    // In tests, we serve the extension files as a plain old website.
    devServer: {
        // contentBase: DIST,
        // devMiddleware: {
        //     publicPath: DIST,
        // },
        port: 9011,
        // writeToDisk: true,
        static: DIST,
    },
};
