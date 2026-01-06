// PostCSS 配置文件
// 使用 ES Module 语法导出配置

export default {
  plugins: {
    // 自动添加浏览器前缀
    autoprefixer: {}
    // 注释掉 postcss-px-to-viewport 插件，避免桌面端页面异常放大
    // 'postcss-px-to-viewport': {
    //   viewportWidth: 375, // 设计稿的视口宽度
    //   viewportHeight: 667, // 设计稿的视口高度
    //   unitPrecision: 5, // 单位转换后保留的精度
    //   viewportUnit: 'vw', // 希望使用的视口单位
    //   selectorBlackList: ['.ignore', '.hairlines'], // 指定不转换为视口单位的类
    //   minPixelValue: 1, // 小于或等于 1px 不转换为视口单位
    //   mediaQuery: false // 允许在媒体查询中转换 px
    // }
  }
} 