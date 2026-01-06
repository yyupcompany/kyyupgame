/**
 * 🏫 PWA配置文件
 * 
 * 基于 03-快速开始指南.md 的PWA实现
 */

export interface PWAManifest {
  name: string
  short_name: string
  description: string
  start_url: string
  display: string
  theme_color: string
  background_color: string
  scope: string
  icons: PWAIcon[]
  categories: string[]
  lang: string
  orientation: string
}

export interface PWAIcon {
  src: string
  sizes: string
  type: string
  purpose?: string
}

const pwaConfig: PWAManifest = {
  name: '幼儿园管理系统',
  short_name: '幼儿园管理',
  description: '专业的幼儿园综合管理平台 - 招生、教学、家长沟通一体化',
  start_url: '/mobile',
  display: 'standalone',
  theme_color: '#1890ff',
  background_color: '#ffffff',
  scope: '/mobile/',
  
  // PWA图标配置
  icons: [
    {
      src: '/icons/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/icons/icon-96x96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/icons/icon-128x128.png',
      sizes: '128x128',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/icons/icon-144x144.png',
      sizes: '144x144',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/icons/icon-152x152.png',
      sizes: '152x152',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/icons/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ],
  
  // 应用分类
  categories: ['education', 'productivity', 'utilities'],
  
  // 语言和方向
  lang: 'zh-CN',
  orientation: 'portrait-primary'
}

// Service Worker配置
export const swConfig = {
  // 缓存策略
  cacheStrategies: {
    // API请求 - 网络优先
    api: 'NetworkFirst',
    // 静态资源 - 缓存优先
    static: 'CacheFirst',
    // 页面 - 模式优先（离线时使用缓存）
    pages: 'StaleWhileRevalidate',
    // 图片 - 缓存优先
    images: 'CacheFirst'
  },
  
  // 缓存名称
  cacheName: {
    static: 'kindergarten-static-v1',
    api: 'kindergarten-api-v1',
    pages: 'kindergarten-pages-v1',
    images: 'kindergarten-images-v1'
  },
  
  // 缓存时间 (秒)
  cacheTime: {
    static: 86400 * 30,  // 30天
    api: 300,            // 5分钟
    pages: 86400,        // 1天
    images: 86400 * 7    // 7天
  }
}

export default pwaConfig