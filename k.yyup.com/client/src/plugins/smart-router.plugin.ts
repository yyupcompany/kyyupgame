/**
 * 智能路由插件
 * 为Vue应用提供全局的智能路由功能
 */

import { App } from 'vue'
import { Router } from 'vue-router'
import { SmartRouterService } from '../services/smart-router.service'

// 声明全局属性类型
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $smartRouter: SmartRouterService
  }
}

export default {
  install(app: App, router: Router) {
    // 创建智能路由服务实例
    const smartRouter = new SmartRouterService(router)
    
    // 添加全局属性
    app.config.globalProperties.$smartRouter = smartRouter
    
    // 提供注入
    app.provide('smartRouter', smartRouter)
    
    console.log('🚀 智能路由插件已安装')
  }
}