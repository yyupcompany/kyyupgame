/**
 * 🏫 移动端应用入口文件
 * 
 * 基于 docs/ai移动端说明/ 的完整架构实现
 * 集成所有移动端功能：PWA、AI助手、响应式设计、离线支持
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 移动端核心模块
import { mobileRoutes } from './router/mobile.routes'
import { useMobileStore } from './stores/mobile'
import { useAiAssistantStore } from './stores/ai-assistant'
import PWAPlugin from './utils/pwa'
import mobileConfig from './config/mobile.config'

// 样式
import './styles/mobile.scss'

// 主应用组件
import App from '../App.vue'

/**
 * 创建移动端应用实例
 */
export async function createMobileApp() {
  console.log('[Mobile] 🏫 初始化移动端应用...')

  // 创建Vue应用
  const app = createApp(App)

  // 创建Pinia状态管理
  const pinia = createPinia()
  app.use(pinia)

  // 创建路由器
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      {
        path: '/',
        redirect: '/mobile/dashboard'
      },
      ...mobileRoutes,
      // 404页面
      {
        path: '/:pathMatch(.*)*',
        redirect: '/mobile/404'
      }
    ],
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }
      return { top: 0, behavior: 'smooth' }
    }
  })

  // 安装Element Plus
  app.use(ElementPlus)
  
  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 安装PWA插件
  app.use(PWAPlugin)

  // 安装路由
  app.use(router)

  // 初始化移动端功能
  await initializeMobileFeatures(app)

  // 设置路由守卫
  setupRouterGuards(router)

  console.log('[Mobile] ✅ 移动端应用初始化完成')

  return { app, router, pinia }
}

/**
 * 初始化移动端功能
 */
async function initializeMobileFeatures(app: any) {
  console.log('[Mobile] 🔧 初始化移动端功能...')

  try {
    // 获取移动端存储实例
    const mobileStore = useMobileStore()
    const aiStore = useAiAssistantStore()

    // 1. 初始化设备检测
    mobileStore.initializeDevice()

    // 2. 初始化AI助手
    await aiStore.initialize()

    // 3. 设置性能优化
    if (!mobileStore.getPerformanceInfo().isHighPerformance) {
      mobileStore.optimizePerformance()
    }

    // 4. 注册全局错误处理
    app.config.errorHandler = (error: Error, vm: any, info: string) => {
      console.error('[Mobile] Vue Error:', error, info)
      
      // 发送错误到监控服务
      if (window.navigator.onLine) {
        reportError(error, { component: vm?.$options.name, info })
      }
    }

    // 5. 注册全局属性
    app.config.globalProperties.$mobile = mobileStore
    app.config.globalProperties.$ai = aiStore
    app.config.globalProperties.$config = mobileConfig

    // 6. 设置全局指令
    setupGlobalDirectives(app)

    // 7. 设置全局组件
    setupGlobalComponents(app)

    console.log('[Mobile] ✅ 移动端功能初始化完成')

  } catch (error) {
    console.error('[Mobile] ❌ 移动端功能初始化失败:', error)
    throw error
  }
}

/**
 * 设置路由守卫
 */
function setupRouterGuards(router: any) {
  // 权限验证守卫
  router.beforeEach(async (to: any, from: any, next: any) => {
    console.log('[Mobile] 🛡️ 路由守卫:', to.path)

    try {
      // 检查是否需要认证
      if (to.meta?.requiresAuth !== false) {
        const isAuthenticated = await checkAuthentication()
        
        if (!isAuthenticated) {
          console.log('[Mobile] 🔐 未认证，重定向到登录页')
          next('/mobile/login')
          return
        }
      }

      // 检查权限
      if (to.meta?.roles) {
        const hasPermission = await checkPermission(to.meta.roles)
        
        if (!hasPermission) {
          console.log('[Mobile] 🚫 权限不足，重定向到403页面')
          next('/mobile/error?code=403')
          return
        }
      }

      // 检查网络状态
      if (!navigator.onLine && to.meta?.requiresNetwork) {
        console.log('[Mobile] 📶 网络离线，重定向到离线页面')
        next('/mobile/offline')
        return
      }

      next()

    } catch (error) {
      console.error('[Mobile] 路由守卫错误:', error)
      next('/mobile/error?code=500')
    }
  })

  // 路由变化后的处理
  router.afterEach((to: any, from: any) => {
    // 更新页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - 幼儿园管理系统`
    }

    // 发送页面访问统计
    if (window.navigator.onLine) {
      reportPageView(to.path, to.meta?.title)
    }

    // 触觉反馈
    const mobileStore = useMobileStore()
    if (mobileStore.isTouch) {
      mobileStore.hapticFeedback('light')
    }
  })
}

/**
 * 设置全局指令
 */
function setupGlobalDirectives(app: any) {
  // 触摸涟漪效果指令
  app.directive('ripple', {
    mounted(el: HTMLElement) {
      el.classList.add('mobile-ripple')
      
      el.addEventListener('touchstart', (e: TouchEvent) => {
        const rect = el.getBoundingClientRect()
        const touch = e.touches[0]
        const x = touch.clientX - rect.left
        const y = touch.clientY - rect.top
        
        const ripple = document.createElement('div')
        ripple.className = 'ripple-effect'
        ripple.style.left = `${x}px`
        ripple.style.top = `${y}px`
        
        el.appendChild(ripple)
        
        setTimeout(() => {
          ripple.remove()
        }, 600)
      })
    }
  })

  // 长按指令
  app.directive('longpress', {
    mounted(el: HTMLElement, binding: any) {
      let timer: NodeJS.Timeout
      
      const start = () => {
        timer = setTimeout(() => {
          if (typeof binding.value === 'function') {
            binding.value()
          }
        }, binding.arg || 500)
      }
      
      const cancel = () => {
        clearTimeout(timer)
      }
      
      el.addEventListener('touchstart', start)
      el.addEventListener('touchend', cancel)
      el.addEventListener('touchcancel', cancel)
      el.addEventListener('mousedown', start)
      el.addEventListener('mouseup', cancel)
      el.addEventListener('mouseleave', cancel)
    }
  })

  // 懒加载指令
  app.directive('lazy', {
    mounted(el: HTMLElement, binding: any) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = binding.value
            img.classList.remove('lazy-loading')
            observer.unobserve(img)
          }
        })
      })
      
      el.classList.add('lazy-loading')
      observer.observe(el)
    }
  })
}

/**
 * 设置全局组件
 */
function setupGlobalComponents(app: any) {
  // 注册移动端通用组件
  const componentModules = import.meta.glob('./components/*.vue', { eager: true })
  
  Object.entries(componentModules).forEach(([path, module]: [string, any]) => {
    const componentName = path
      .split('/')
      .pop()
      ?.replace('.vue', '')
    
    if (componentName && module.default) {
      app.component(componentName, module.default)
    }
  })
}

/**
 * 检查用户认证状态
 */
async function checkAuthentication(): Promise<boolean> {
  try {
    // 检查本地存储的token
    const token = localStorage.getItem('access_token')
    if (!token) return false

    // 验证token有效性
    const response = await fetch('/api/auth/validate', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * 检查用户权限
 */
async function checkPermission(requiredRoles: string[]): Promise<boolean> {
  try {
    const userRole = localStorage.getItem('user_role')
    return userRole ? requiredRoles.includes(userRole) : false
  } catch {
    return false
  }
}

/**
 * 报告错误到监控服务
 */
function reportError(error: Error, context?: any) {
  // 这里可以集成到错误监控服务
  console.error('[Mobile] Error Report:', {
    message: error.message,
    stack: error.stack,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  })
}

/**
 * 报告页面访问统计
 */
function reportPageView(path: string, title?: string) {
  // 这里可以集成到分析服务
  console.log('[Mobile] Page View:', {
    path,
    title,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  })
}

/**
 * 启动移动端应用
 */
export async function startMobileApp() {
  try {
    console.log('[Mobile] 🚀 启动移动端应用...')

    const { app } = await createMobileApp()
    
    // 挂载应用
    app.mount('#app')
    
    console.log('[Mobile] ✅ 移动端应用启动成功')
    console.log('[Mobile] 📱 支持的功能:')
    console.log('  - 响应式设计 ✓')
    console.log('  - PWA离线支持 ✓')
    console.log('  - AI智能助手 ✓')
    console.log('  - 触摸手势 ✓')
    console.log('  - 推送通知 ✓')
    console.log('  - 后台同步 ✓')

    return app

  } catch (error) {
    console.error('[Mobile] ❌ 应用启动失败:', error)
    
    // 显示错误页面
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        padding: 20px;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      ">
        <h1 style="color: #f5222d; margin-bottom: 16px;">应用启动失败</h1>
        <p style="color: #8c8c8c; margin-bottom: 24px;">
          很抱歉，移动端应用启动时遇到了问题。
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            padding: 12px 24px;
            background: #1890ff;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
          "
        >
          重新加载
        </button>
      </div>
    `
    
    throw error
  }
}

// 如果是直接运行此文件，则启动应用
if (import.meta.env.MODE === 'mobile') {
  startMobileApp()
}

export default startMobileApp