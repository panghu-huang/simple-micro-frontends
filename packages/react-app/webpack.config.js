const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MicroFrontendsPlugin = require('../micro-frontends-plugin')

const resolve = p => path.resolve(__dirname, p)

const resolveAppPath = p => path.resolve(__dirname, '../../', p)

const name = 'react_app'

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: resolve('index.tsx'),
  output: {
    publicPath: './react-app',
    path: resolveAppPath('dist/react-app'),
    library: name,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.d.ts', '.d.tsx', '.js', '.jsx'],
    alias: {
      shared: resolveAppPath('packages/shared'),
    }
  },
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
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
    }),
    new MicroFrontendsPlugin({
      name,
      path: '/react',
    })
  ]
}