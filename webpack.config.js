const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { spawn } = require('child_process')
const electron = require('electron')
const { watch } = require('fs')

const config = require('./config')

let electronProcess

const respawnElectron = () => {
  if (electronProcess) electronProcess.kill()
  electronProcess = spawn(electron, ['electron'])
}

module.exports = () => ({
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),

    new VueLoaderPlugin(),

    new CopyPlugin({
      patterns: [
        {
          from: 'electron',
          to: '', 
        },
      ],
    }),

    new class StartElectron {
      apply (compiler) {
        let started = false

        compiler.hooks.done.tap('start electron', () => {
          if (process.env.NODE_ENV === 'development' && !started) {
            try {
              started = true
            
              respawnElectron()
  
              watch(path.resolve('electron'), event => {
                if (event === 'change') respawnElectron()
              })
            } catch (error) {
              console.error(error)
              process.exit()
            }
          }
        })
      }
    },
  ],

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader', 
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|webp|gif|woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.vue'],
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: "[name].bundle.js",
    chunkFilename: '[name].bundle.js',
  },

  mode: process.env.NODE_ENV,

  devtool: process.env.NODE_ENV === 'production' ? 'none' : 'source-map',

  devServer: {
    port: config.port,
    historyApiFallback: true,
  },
})
