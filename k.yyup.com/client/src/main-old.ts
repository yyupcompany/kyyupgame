import { createApp } from 'vue'
import App from './App.vue'
// 使用正式路由配置
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

import 'element-plus/dist/index.css'

// 🎯 使用项目原有的样式文件，与pages中的样式命名一致
import './styles/index.scss'  // 使用恢复后的index.scss文件
// 注释掉demo的global.scss，避免冲突
// import './styles/global.scss'

// 📝 注释掉重复的样式引入，避免冲突
// import './styles/layout-reset.css'  // 已包含在 global.scss 中
// import '@/assets/scss/main.scss'    // 重复的SCSS文件，已注释
// import '@/assets/styles/main.css'   // 重复的CSS文件，已注释
// import './styles/logo-fix.css'      // 已包含在 global.scss 中
// import './styles/layout-fix.css'    // 已包含在 global.scss 中

import './permission'
import env from './env'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { apiRulesChecker } from './utils/api-rules-checker'
import { ErrorHandler } from './utils/errorHandler'

// 注释掉主题系统初始化，让demo使用自己的样式系统
// import { initTheme, currentTheme } from './utils/theme'

// 创建Pinia实例
const pinia = createPinia()

// 创建应用
const app = createApp(App)

// 注册所有图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 添加插件
app.use(router)
app.use(pinia)
app.use(ElementPlus, {
  locale: zhCn
})

// 提供环境配置
app.provide('env', env)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue全局错误:', err)
  console.info('错误发生位置:', instance)
  console.info('错误信息:', info)
  
  // 使用ErrorHandler提供用户友好的错误提示
  try {
    // 如果是HTTP错误，让request拦截器处理
    if ((err as any).name === 'AxiosError') {
      return;
    }

    // 其他Vue运行时错误，显示通用错误消息
    const userMessage = ErrorHandler.createUserFriendlyMessage({
      message: (err as Error).message || '页面运行时出现错误',
      name: (err as Error).name || 'RuntimeError'
    });
    
    // 显示用户友好的错误提示
    ErrorHandler.handle({
      message: userMessage,
      name: 'VueRuntimeError',
      detail: { 
        component: instance?.$?.type?.name || 'Unknown',
        errorInfo: info 
      }
    }, true);
  } catch (handlerError) {
    // 如果ErrorHandler也出错了，至少显示基本提示
    console.error('ErrorHandler处理失败:', handlerError);
    import('element-plus').then(({ ElMessage }) => {
      ElMessage.error('系统出现异常，请刷新页面重试');
    });
  }
}

// 全局未捕获错误处理
window.addEventListener('error', (event) => {
  console.error('全局未捕获错误:', event.error);
  
  try {
    ErrorHandler.handle({
      message: event.error?.message || '页面出现未知错误',
      name: 'UncaughtError',
      detail: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      }
    }, true);
  } catch (handlerError) {
    console.error('ErrorHandler处理失败:', handlerError);
    import('element-plus').then(({ ElMessage }) => {
      ElMessage.error('系统出现异常，请刷新页面重试');
    });
  }
});

// 全局未捕获Promise错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未捕获的Promise错误:', event.reason);
  
  try {
    ErrorHandler.handle({
      message: event.reason?.message || '异步操作失败',
      name: 'UnhandledPromiseRejection',
      detail: event.reason
    }, true);
    
    // 阻止默认的错误处理
    event.preventDefault();
  } catch (handlerError) {
    console.error('ErrorHandler处理失败:', handlerError);
    import('element-plus').then(({ ElMessage }) => {
      ElMessage.error('系统出现异常，请刷新页面重试');
    });
  }
});

// 在开发环境下启用API规则检查
if (process.env.NODE_ENV === 'development') {
  apiRulesChecker.enable()
  console.log('[API规则检查器] 已在开发环境中启用')
}

// 注释掉主题检查，让demo使用自己的样式
// if (currentTheme.value === 'dark') {
//   console.log('[Main] 应用挂载前设置暗黑主题标记');
//   document.documentElement.setAttribute('data-theme', 'dark');
//   document.documentElement.classList.add('dark-theme');
//   document.body.classList.add('el-theme-dark');
// }

// 挂载应用
app.mount('#app')

// 注释掉主题检查，让demo使用自己的样式
// setTimeout(() => {
//   console.log('[Main] 应用挂载后主题检查');
//   console.log('[Main] 当前主题:', currentTheme.value);
//   console.log('[Main] HTML类名:', document.documentElement.className);
//   console.log('[Main] 主题属性:', document.documentElement.getAttribute('data-theme'));
//   
//   // 检查CSS变量是否生效
//   const computedStyle = getComputedStyle(document.documentElement);
//   console.log('[Main] --bg-primary:', computedStyle.getPropertyValue('--bg-primary'));
//   console.log('[Main] --text-primary:', computedStyle.getPropertyValue('--text-primary'));
// }, 100);

// 启用HMR
if (import.meta.hot) {
  import.meta.hot.accept();
} 