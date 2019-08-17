// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  hash: true,
  targets: {
    ie: 11
  },
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: {
          hmr: true
        },
        title: 'Kuu',
        locale: {
          default: 'en-US',
          baseNavigator: true,
          antd: true
        },
        dynamicImport: {
          webpackChunkName: true
        },
        chunks: ['vendors', 'umi']
      }
    ]
  ],
  proxy: {
    '/api': {
      target: 'http://localhost:8080/',
      changeOrigin: true
    },
    '/assets': {
      target: 'http://localhost:8080/',
      changeOrigin: true
    }
  },
  chainWebpack (config) {
    config.optimization.splitChunks({
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/
        },
        commons: {
          name: 'commons',
          chunks: 'async',
          minChunks: 2,
          minSize: 0
        }
      }
    })
  }
}
