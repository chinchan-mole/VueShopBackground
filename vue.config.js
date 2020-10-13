module.exports = {
  devServer: {
    proxy: { // 为高德接口配置代理，解决跨域
      '/amap/': {
        target: 'https://restapi.amap.com/v3/', // 高德V3接口地址
        secure: false, // false为http访问，true为https访问
        changeOrigin: true, // 跨域访问设置，true代表跨域
        pathRewrite: { // 路径改写规则
          '^/amap/': '' // 以/amap/为开头的改写为'',以便将target直接与后面的拼接，若后面不为空，则....
        }
      }
    }
  }
}
