const path = require('path')
const shell = require('shelljs')
const fs = require('fs')
const archiver = require('archiver')
// 超过10kb开启gzip压缩
// const CompressionWebpackPlugin = require('compression-webpack-plugin')
// const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: './',

  // 构建输出目录
  outputDir: 'dist',

  productionSourceMap: false,

  css: {
    sourceMap: false,
    loaderOptions: {
      css: {},
      postcss: {},
      stylus: {
        'resolve url': true,
        import: ['./src/theme']
      }
    }
  },

  devServer: {
    proxy: {
      '/gpas': {
        target: 'https://gptest.palmte.cn/',
        changeOrigin: true,
        pathRewrite: {},
        bypass: function(req, res) {
          if (req.headers.accept.indexOf('html') !== -1) {
            console.log('Skipping proxy for browser request.')
            return '/index.html'
          } else if (process.env.MOCK === 'mock') {
            console.log(req.path)
            if (!/\.(png|jpg|gif)$/.test(req.path)) {
              const name = req.path
                .split('/gpas/school/')[1]
                .split('/')
                .join('_')
              const mock = require(`./mock/${name}`)
              const result = mock(req.method, req.query)
              // 清楚mock的缓存
              delete require.cache[require.resolve(`./mock/${name}`)]
              return res.send(result)
            }
          }
        }
      },
      '/upload': {
        target: 'https://gptest.palmte.cn/',
        changeOrigin: true,
        pathRewrite: {},
        bypass: function(req, res) {
          if (req.headers.accept.indexOf('html') !== -1) {
            console.log('Skipping proxy for browser request.')
            return '/index.html'
          }
        }
      },
      '/dzg': {
        target: 'https://gptest.palmte.cn/',
        changeOrigin: true,
        pathRewrite: {},
        bypass: function(req, res) {
          if (req.headers.accept.indexOf('html') !== -1) {
            console.log('Skipping proxy for browser request.')
            return '/index.html'
          }
        }
      }
    }
  },

  pwa: {
    iconPaths: {
      favicon32: './cmcc_logo.png',
      favicon16: './cmcc_logo.png',
      appleTouchIcon: './cmcc_logo.png',
      maskIcon: './cmcc_logo.png',
      msTileImage: './cmcc_logo.png'
    }
  },
  chainWebpack: config => {
    // 为路径设置别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('src', resolve('src'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
      .set('@static', resolve('public'))
  },

  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // 为生产环境修改配置...
      // var webpack = require('webpack')
      // new webpack.WebpackOptionsDefaulter().process(config)
      // const compiler = new webpack.Compiler()
      // compiler.plugin('done', (compilation) => {
      //   console.log('abcde')
      // })
      // config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true // 打包去掉console
      var buildStartFn = function() {
        shell.rm('-rf', 'campuspartner_h5.zip') // remove archive file
        shell.rm('-rf', '_tmp_campuspartner_h5_archive') // remove archive folder
      }
      var buildSuccessFn = function() {
        shell.mkdir('-p', '_tmp_campuspartner_h5_archive') // 新建临时目录
        shell.cp('-R', 'dist/*', '_tmp_campuspartner_h5_archive') // 把生成的文件复制到临时目录
        var output = fs.createWriteStream('campuspartner_h5.zip') // 创建一个zip文件
        var archive = archiver('zip') // 创建压缩zip的实例
        archive.on('error', function(err) {
          console.log('Archive error')
          throw err
        })
        archive.on('end', function(err) {
          // 监听end，压缩文件已经被归档完成
          console.log('Archive end')
          if (err) {
            console.log(err)
          }
          shell.rm('-rf', '_tmp_campuspartner_h5_archive') // remove archive folder
        })
        archive.pipe(output)
        archive.directory('_tmp_campuspartner_h5_archive', false) // 向zip文件中添加文件
        archive.finalize() // 结束压缩
      }
      const WebpackShellPlugin = require('./webpack-shell-plugin')
      config.plugins.push(
        new WebpackShellPlugin({
          onBuildStart: ['echo Build Start', buildStartFn],
          onBuildSuccess: [
            'echo Archiving zip...',
            buildSuccessFn,
            'echo Build Success成功'
          ]
        })
      )
      // 开启gzip
      // const plugins = []
      // plugins.push(
      //   new CompressionWebpackPlugin({
      //     filename: '[path].gz[query]',
      //     algorithm: 'gzip',
      //     test: productionGzipExtensions,
      //     threshold: 10240,
      //     minRatio: 0.8
      //   })
      // )
      // config.plugins = [
      //   ...config.plugins,
      //   ...plugins
      // ]
      console.log(process.env.BASE_URL)
    } else {
      // 为开发环境修改配置...
    }
    config.performance = {
      hints: false
    }
    config.module.rules.push({
      test: /\.(sa|sc)ss$/,
      use: [
        {
          loader: 'sass-loader',
          options: {}
        }
      ]
    })
  },

  pluginOptions: {
    'cube-ui': {
      postCompile: true,
      theme: true
    }
  }
}
