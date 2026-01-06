import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 导入 Vant 4 移动端UI组件库
import setupVant from './plugins/vant'

// 导入样式文件 - 先导入我们的主题样式
// 先导入 Element Plus 样式，确保后续自定义覆盖生效
import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/index.css'

// 引入设计令牌（基础变量，不依赖主题）
import './styles/design-tokens.scss'

// 再导入全局样式
import './styles/index.scss'
import './styles/layout-fixes.scss'
import './styles/global-theme-override.scss'

// 引入主题变量（四种主题的 CSS 变量）- 最后导入确保最高优先级
import './styles/themes/theme-variables.scss'

// 按需导入关键图标组件
import {
  ArrowDown, ArrowUp, ArrowLeft, ArrowRight,
  Plus, Minus, Delete, Edit, Search, Refresh,
  User, Setting, Menu, Close, Check, View,
  // 教师客户跟踪SOP系统需要的图标
  Promotion, ChatDotRound, Picture, MagicStick, DataAnalysis,
  Trophy, List, ChatLineRound, QuestionFilled, Right,
  TrendCharts, Lightning, Upload, CaretTop, CaretBottom, Phone,
  Clock, Loading, Connection, SuccessFilled
} from '@element-plus/icons-vue'

// 简化性能优化工具导入，避免启动延迟
import { enhancedErrorHandler } from './utils/enhanced-error-handler'

// 移动端性能优化（异步导入避免阻塞启动）
if (window.innerWidth <= 768) {
  import('./utils/mobile-performance').then(({ performanceMonitor }) => {
    performanceMonitor.startTiming('mobile_app_init')
    console.log('📱 移动端性能优化已启用')
  })
}

// 导入全局组件
import AppCard from './components/AppCard.vue'
import AppCardHeader from './components/AppCardHeader.vue'
import AppCardTitle from './components/AppCardTitle.vue'
import AppCardContent from './components/AppCardContent.vue'
import UnifiedIcon from './components/icons/UnifiedIcon.vue'

// 导入API拦截器配置
import './api/interceptors'

// 启用紧急修复，解决localhost导航超时问题
import './utils/navigation-timeout-emergency-fix'

// 导入视觉调试工具（开发环境）
if (import.meta.env.DEV) {
  import('./utils/visual-debugger' as any).then(() => {
    console.log('🎨 视觉调试工具已加载');
  });
}

// 导入权限指令
import { installPermissionDirectives } from './directives/permission'

// 导入智能路由插件
import smartRouterPlugin from './plugins/smart-router.plugin'

console.log('🚀 开始创建应用...')

// 移除模拟认证，使用真实认证
const initDevAuth = () => {
  // 不再设置模拟认证，使用真实认证流程
  console.log('🔧 使用真实认证流程');
};

// 初始化开发环境认证
initDevAuth();

// 应用主题作用域类与主题初始化
if (typeof document !== 'undefined') {
  document.body.classList.add('theme-workbench')

  // 获取保存的主题
  const savedTheme = localStorage.getItem('app-theme') || localStorage.getItem('app_theme')
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

  // 确定主题 - 支持新的主题类型
  let theme: string
  if (savedTheme) {
    theme = savedTheme
  } else {
    theme = prefersDark ? 'dark' : 'light'
  }

  // 应用主题类
  document.documentElement.setAttribute('data-theme', theme)
  document.body.classList.toggle('theme-dark', theme === 'dark' || theme === 'glass-dark')
  document.body.classList.toggle('theme-light', theme !== 'dark' && theme !== 'glass-dark')

  // 添加玻璃台主题类
  if (theme === 'glass-light') {
    document.documentElement.classList.add('glass-light')
    document.body.classList.add('glass-light')
  } else if (theme === 'glass-dark') {
    document.documentElement.classList.add('glass-dark')
    document.body.classList.add('glass-dark')
    document.body.classList.add('el-theme-dark')
  } else if (theme === 'dark') {
    document.body.classList.add('el-theme-dark')
  }
}

// 生产环境禁用 HMR 和 WebSocket 连接
if (import.meta.env.PROD || import.meta.env.VITE_HMR_ENABLED === 'false') {
  console.log('🚫 Production mode: Disabling HMR and WebSocket connections')

  // 禁用 Vite 的 HMR WebSocket 连接
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      // 清理 HMR 资源
    })
    if (typeof import.meta.hot.send === 'function') {
      import.meta.hot.send = () => {}
    }
    // 完全禁用 HMR
    import.meta.hot.invalidate = () => {}
  }

  // 防止页面尝试连接 WebSocket (完全拦截)
  const OriginalWebSocket = window.WebSocket
  window.WebSocket = class extends OriginalWebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      const urlStr = url.toString()
      // 拦截所有 Vite HMR WebSocket 连接
      if (urlStr.includes('24678') ||
          urlStr.includes(import.meta.env.VITE_DEV_HOST || 'localhost') ||
          urlStr.includes('127.0.0.1') ||
          urlStr.includes('0.0.0.0') ||
          urlStr.includes('ws://') ||
          urlStr.includes('wss://') && (urlStr.includes('24678') || urlStr.includes(import.meta.env.VITE_DEV_HOST || 'localhost'))) {
        // 静默拦截 WebSocket 连接，避免显示开发主机信息
        // console.log('🚫 Blocked WebSocket connection in production:', urlStr)
        // 创建一个假的 WebSocket 实例，避免错误
        const fakeWs = {
          close: () => {},
          send: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          readyState: 3, // CLOSED
          CONNECTING: 0,
          OPEN: 1,
          CLOSING: 2,
          CLOSED: 3
        }
        return fakeWs as any
      }
      super(url, protocols)
    }
  }

  // 确保不会尝试连接 HMR
  if (typeof window !== 'undefined') {
    (window as any).__vite_plugin_react_preamble_installed__ = true
  }
}

// 创建Pinia实例
const pinia = createPinia()

// 创建应用
const app = createApp(App)

console.log('📦 Vue应用创建成功')

// 注册关键图标
const icons = {
  ArrowDown, ArrowUp, ArrowLeft, ArrowRight,
  Plus, Minus, Delete, Edit, Search, Refresh,
  User, Setting, Menu, Close, Check, View,
  // 教师客户跟踪SOP系统图标
  Promotion, ChatDotRound, Picture, MagicStick, DataAnalysis,
  Trophy, List, ChatLineRound, QuestionFilled, Right,
  TrendCharts, Lightning, Upload, CaretTop, CaretBottom, Phone,
  Clock, Loading, Connection, SuccessFilled
}

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component)
})

console.log('✅ 关键图标注册完成')

// 注册全局组件
app.component('app-card', AppCard)
app.component('app-card-header', AppCardHeader)
app.component('app-card-title', AppCardTitle)
app.component('app-card-content', AppCardContent)
app.component('UnifiedIcon', UnifiedIcon)

// 添加插件
app.use(router)
app.use(pinia)
app.use(ElementPlus, {
  locale: zhCn,
  zIndex: 3000
})
app.use(smartRouterPlugin, router)

// 注册 Vant 移动端UI组件
setupVant(app)

// 注册权限指令 - Level 4
installPermissionDirectives(app)

console.log('插件添加完成')

// 全局错误处理 - 整合增强错误处理器
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue全局错误:', err)
  console.info('错误发生位置:', instance)
  console.info('错误信息:', info)

  // 上报到增强错误处理器
  enhancedErrorHandler.reportError(err as Error, {
    componentName: instance?.$options.name || 'Unknown',
    componentInfo: info,
    type: 'vue-error'
  })
}

console.log('开始挂载应用')

// 挂载应用
app.mount('#app')

console.log('应用挂载完成')

// 全局暴露Vue应用实例，便于调试和组件监控
if (typeof window !== 'undefined') {
  ;(window as any).__VUE_APP__ = app
  ;(window as any).__VUE_CONFIG__ = app.config
  // 兼容性：也暴露到__VUE__以支持旧版本的工具
  ;(window as any).__VUE__ = app
  console.log('Vue应用配置已暴露到全局')
}

// 简化系统初始化，避免启动延迟
console.log('✅ 应用启动完成')