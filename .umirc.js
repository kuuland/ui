// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: false,
        title: 'Kuu',
        dll: false,
        routes: {
          exclude: [
            /models\//,
            /services\//,
            /model\.(t|j)sx?$/,
            /service\.(t|j)sx?$/,
            /components\//
          ]
        },
        locale: {
          default: 'en-US',
          baseNavigator: true,
          antd: true
        }
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
  targets: {
    ie: 11
  }
}
