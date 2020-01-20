const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')

const resolve = p => path.resolve(__dirname, p)

const resolveAppPath = p => path.resolve(__dirname, '../../', p)

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: resolve('index.tsx'),
  output: {
    publicPath: './',
    path: resolveAppPath('dist'),
  },
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.d.ts', '.d.tsx', '.js', '.jsx'],
    alias: {
      shared: resolveAppPath('packages/shared'),
    }
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: resolve('index.html'),
    })
  ]
}