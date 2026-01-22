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
  Clock, Loading, Connection, SuccessFilled,
  // 业务中心需要的图标
  Document, CircleCheck
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

  // 获取保存的主题；若无记录则强制使用亮色，避免生产环境误触系统暗色导致样式错乱
  const savedTheme = localStorage.getItem('app-theme') || localStorage.getItem('app_theme')
  const theme = savedTheme || 'light'

  // 应用主题类
  document.documentElement.setAttribute('data-theme', theme)
  document.body.classList.toggle('theme-dark', theme === 'dark')
  document.body.classList.toggle('theme-light', theme !== 'dark')

  // 应用暗黑主题类
  if (theme === 'dark') {
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

/**
 * 监控服务日志工具（仅在开发环境启用）
 * 当监控服务不可用时，静默失败不影响核心功能
 */
const monitoringLog = (location: string, message: string, data: any = {}, hypothesisId: string = '') => {
  // 仅在开发环境且明确启用监控时才发送日志
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MONITORING === 'true') {
    fetch('http://127.0.0.1:7242/ingest/4df3407f-ed7c-4ec0-82b0-d0ab5b298ef9', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location,
        message,
        data,
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId
      })
    }).catch(() => {
      // 监控服务不可用时静默失败，不影响应用运行
    })
  }
}

// #region agent log
monitoringLog('main.ts:168', 'Before Pinia creation', {}, 'B')
// #endregion

// 创建Pinia实例
const pinia = createPinia()

// #region agent log
monitoringLog('main.ts:170', 'Pinia created', { piniaType: typeof pinia }, 'B')
// #endregion

// 创建应用
const app = createApp(App)

// #region agent log
monitoringLog('main.ts:173', 'Vue app created', { appType: typeof app }, 'A,C')
// #endregion

console.log('📦 Vue应用创建成功')

// 安装Pinia（必须在使用store之前）
app.use(pinia)

// #region agent log
monitoringLog('main.ts:178', 'Pinia installed on app', {}, 'B')
// #endregion

// 添加插件
// #region agent log
monitoringLog('main.ts:246', 'Before installing plugins', {}, 'C,D')
// #endregion

app.use(router)
// REMOVED: app.use(pinia) - Already installed at line 177, duplicate registration removed!
app.use(ElementPlus, {
  locale: zhCn,
  zIndex: 3000
})

// #region agent log
monitoringLog('main.ts:252', 'After ElementPlus', {}, 'C')
// #endregion

app.use(smartRouterPlugin, router)

// #region agent log
monitoringLog('main.ts:256', 'After smartRouterPlugin', {}, 'D')
// #endregion

// 注册 Vant 移动端UI组件
setupVant(app)

// #region agent log
monitoringLog('main.ts:261', 'After Vant setup', {}, 'C')
// #endregion

// 注册权限指令 - Level 4
installPermissionDirectives(app)

console.log('插件添加完成')

// 注册关键图标
const icons = {
  ArrowDown, ArrowUp, ArrowLeft, ArrowRight,
  Plus, Minus, Delete, Edit, Search, Refresh,
  User, Setting, Menu, Close, Check, View,
  // 教师客户跟踪SOP系统图标
  Promotion, ChatDotRound, Picture, MagicStick, DataAnalysis,
  Trophy, List, ChatLineRound, QuestionFilled, Right,
  TrendCharts, Lightning, Upload, CaretTop, CaretBottom, Phone,
  Clock, Loading, Connection, SuccessFilled,
  // 业务中心图标（添加别名支持）
  Book: Document, // book图标使用Document替代
  Document,
  ClipboardCheck: CircleCheck, // ClipboardCheck使用CircleCheck替代
  CircleCheck
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

console.log('✅ 关键图标注册完成')

// 性能优化：应用初始化时恢复用户状态和权限
// RE-ENABLED: 在app.mount之前执行状态恢复，确保登录状态正确加载
;(async () => {
  try {
    const { useUserStore } = await import('./stores/user')
    const { usePermissionsStore } = await import('./stores/permissions-simple')

    const userStore = useUserStore()
    const permissionsStore = usePermissionsStore()

    // 检查项5优化：从localStorage恢复用户状态（前置到应用初始化）
    console.log('🔄 应用初始化：恢复用户状态...')
    userStore.tryRestoreFromLocalStorage()

    // 检查项6优化：如果用户已登录，初始化权限系统（前置到应用初始化）
    if (userStore.isLoggedIn && userStore.user?.role) {
      console.log('🔐 应用初始化：初始化权限系统...')
      await permissionsStore.initializePermissions(userStore.user.role)
      console.log('✅ 应用初始化：权限系统就绪')
    } else {
      console.log('⚠️ 应用初始化：用户未登录，跳过权限初始化')
    }
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
  }
})()

console.log('开始挂载应用')

// 挂载应用（必须在所有插件和组件注册之后）
app.mount('#app')

console.log('应用挂载完成')

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