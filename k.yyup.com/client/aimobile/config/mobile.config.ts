/**
 * 🏫 移动端配置文件
 * 
 * 基于 02-技术栈详解.md 的移动端技术规范
 */

export interface MobileConfig {
  // 设备适配配置
  breakpoints: {
    mobile: number
    tablet: number
    desktop: number
  }
  
  // 触摸手势配置
  gesture: {
    swipeThreshold: number
    tapDelay: number
    longPressDelay: number
  }
  
  // 性能优化配置
  performance: {
    virtualScrollThreshold: number
    lazyLoadOffset: number
    debounceDelay: number
  }
  
  // PWA配置
  pwa: {
    enabled: boolean
    manifestPath: string
    swPath: string
  }
  
  // AI功能配置
  ai: {
    enabled: boolean
    voiceInput: boolean
    smartRecommendation: boolean
    contextAware: boolean
  }
}

const mobileConfig: MobileConfig = {
  // 响应式断点 - 符合主流移动设备
  breakpoints: {
    mobile: 768,   // 手机端
    tablet: 1024,  // 平板端
    desktop: 1200  // 桌面端
  },
  
  // 触摸手势优化
  gesture: {
    swipeThreshold: 50,      // 滑动触发阈值(px)
    tapDelay: 300,           // 点击延迟(ms)
    longPressDelay: 500      // 长按延迟(ms)
  },
  
  // 性能优化参数
  performance: {
    virtualScrollThreshold: 100,  // 虚拟滚动阈值
    lazyLoadOffset: 200,         // 懒加载偏移量(px)
    debounceDelay: 300           // 防抖延迟(ms)
  },
  
  // PWA渐进式Web应用
  pwa: {
    enabled: true,
    manifestPath: '/manifest.json',
    swPath: '/sw.js'
  },
  
  // AI智能功能
  ai: {
    enabled: true,
    voiceInput: true,            // 语音输入
    smartRecommendation: true,   // 智能推荐
    contextAware: true          // 上下文感知
  }
}

export default mobileConfig