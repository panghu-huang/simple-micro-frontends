const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const MicroFrontendsPlugin = require('../micro-frontends-plugin')

const resolve = p => path.resolve(__dirname, p)

const resolveAppPath = p => path.resolve(__dirname, '../../', p)

const name = 'vue_app'

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: resolve('index.ts'),
  output: {
    publicPath: './vue-app',
    path: resolveAppPath('dist/vue-app'),
    library: name,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.d.ts', '.d.tsx', '.js', '.jsx', '.vue'],
    alias: {
      shared: resolveAppPath('packages/shared'),
    }
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new HTMLWebpackPlugin({
      template: resolve('index.html'),
    }),
    new MicroFrontendsPlugin({
      name,
      path: '/vue',
    })
  ]
}