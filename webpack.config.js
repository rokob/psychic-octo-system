const path = require('path');

module.exports = [{
  name: 'main',
  entry: path.join(__dirname, 'setuperror.js'),
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['flow', 'env']
          }
        }
      }
    ]
  }
}]
