/**
 * 🏫 幼儿园管理系统 - Service Worker 模板
 *
 * 基于 03-快速开始指南.md 的PWA实现
 * 提供离线缓存、后台同步、推送通知等功能
 *
 * 注意：这是一个模板文件，实际部署时会通过构建工具注入配置
 */

// 需要缓存的静态资源（这些通常不会变化）
const STATIC_ASSETS = [
  '/',
  '/mobile',
  '/mobile/dashboard',
  '/mobile/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // CSS文件
  '/assets/index.css',
  // JS文件
  '/assets/index.js',
  '/assets/vendor.js'
]

// ==================== Service Worker 事件处理 ====================

// 安装事件
self.addEventListener('install', event => {
  console.log('[SW] 正在安装 Service Worker')

  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] 缓存静态资源')
        return cache.addAll(STATIC_ASSETS)
      }),
      // 缓存离线页面
      caches.open(PAGES_CACHE).then(cache => {
        console.log('[SW] 缓存离线页面')
        return cache.add(OFFLINE_PAGE)
      })
    ]).then(() => {
      console.log('[SW] Service Worker 安装完成')
      // 立即激活新的 Service Worker
      return self.skipWaiting()
    })
  )
})

// 激活事件
self.addEventListener('activate', event => {
  console.log('[SW] 正在激活 Service Worker')

  event.waitUntil(
    Promise.all([
      // 清理旧缓存
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith(CACHE.CACHE_PREFIX) &&
                     !cacheName.includes(CACHE_VERSION)
            })
            .map(cacheName => {
              console.log('[SW] 删除旧缓存:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // 控制所有客户端
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service Worker 激活完成')

      // 通知客户端 Service Worker 已更新
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION
          })
        })
      })
    })
  )
})

// 网络请求拦截
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理同源请求
  if (url.origin !== location.origin) {
    return
  }

  // 使用配置中的端点进行判断
  if (isApiRequest(request.url)) {
    // API请求：网络优先策略
    event.respondWith(handleApiRequest(request))
  } else if (isImageRequest(request)) {
    // 图片请求：缓存优先策略
    event.respondWith(handleImageRequest(request))
  } else if (isPageRequest(request)) {
    // 页面请求：模糊优先策略
    event.respondWith(handlePageRequest(request))
  } else {
    // 静态资源：缓存优先策略
    event.respondWith(handleStaticRequest(request))
  }
})

// 后台同步
self.addEventListener('sync', event => {
  console.log('[SW] 后台同步事件:', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

// 推送消息
self.addEventListener('push', event => {
  console.log('[SW] 收到推送消息:', event.data?.text())

  if (event.data) {
    const data = event.data.json()
    event.waitUntil(showNotification(data))
  }
})

// 通知点击
self.addEventListener('notificationclick', event => {
  console.log('[SW] 通知被点击:', event.notification.data)

  event.notification.close()

  event.waitUntil(
    self.clients.matchAll().then(clients => {
      // 检查是否有已打开的窗口
      const client = clients.find(client => client.visibilityState === 'visible')

      if (client) {
        // 聚焦到已打开的窗口
        client.focus()
        client.postMessage({
          type: 'NOTIFICATION_CLICKED',
          data: event.notification.data
        })
      } else {
        // 打开新窗口
        self.clients.openWindow('/mobile/dashboard')
      }
    })
  )
})

// ==================== 请求处理策略 ====================

// API请求处理：网络优先，失败时返回缓存
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)

  try {
    console.log('[SW] API请求 - 网络优先:', request.url)

    // 尝试网络请求
    const response = await fetch(request)

    if (response.ok) {
      // 检查是否为需要缓存的端点
      if (isCacheableApiEndpoint(request.url)) {
        // 缓存成功的响应
        cache.put(request, response.clone())
      }
      return response
    } else {
      throw new Error(`API请求失败: ${response.status}`)
    }
  } catch (error) {
    console.log('[SW] 网络请求失败，尝试缓存:', error.message)

    // 尝试返回缓存
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // 返回离线响应
    return new Response(
      JSON.stringify(OFFLINE_API_RESPONSE),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// 图片请求处理：缓存优先
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGES_CACHE)

  console.log('[SW] 图片请求 - 缓存优先:', request.url)

  // 先检查缓存
  let response = await cache.match(request)

  if (response) {
    return response
  }

  // 缓存中没有，尝试网络请求
  try {
    response = await fetch(request)

    if (response.ok) {
      // 缓存图片，设置过期时间
      const responseToCache = response.clone()
      responseToCache.headers.set('sw-cache-time', Date.now().toString())
      cache.put(request, responseToCache)
    }

    return response
  } catch (error) {
    console.log('[SW] 图片请求失败:', error.message)

    // 返回默认图片或占位符
    return new Response('', {
      status: 404,
      statusText: 'Image not found'
    })
  }
}

// 页面请求处理：模糊优先
async function handlePageRequest(request) {
  const cache = await caches.open(PAGES_CACHE)

  console.log('[SW] 页面请求 - 模糊优先:', request.url)

  try {
    // 同时发起网络请求和缓存查询
    const [networkResponse, cachedResponse] = await Promise.allSettled([
      fetch(request),
      cache.match(request)
    ])

    // 优先使用网络响应
    if (networkResponse.status === 'fulfilled' && networkResponse.value.ok) {
      // 更新缓存
      cache.put(request, networkResponse.value.clone())
      return networkResponse.value
    }

    // 网络失败，使用缓存
    if (cachedResponse.status === 'fulfilled' && cachedResponse.value) {
      return cachedResponse.value
    }

    // 都失败了，返回离线页面
    return cache.match(OFFLINE_PAGE)

  } catch (error) {
    console.log('[SW] 页面请求处理失败:', error.message)
    return cache.match(OFFLINE_PAGE)
  }
}

// 静态资源处理：缓存优先
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE)

  console.log('[SW] 静态资源 - 缓存优先:', request.url)

  // 先检查缓存
  let response = await cache.match(request)

  if (response) {
    return response
  }

  // 缓存中没有，尝试网络请求
  try {
    response = await fetch(request)

    if (response.ok) {
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.log('[SW] 静态资源请求失败:', error.message)

    // 如果是HTML请求，返回离线页面
    if (request.headers.get('Accept')?.includes('text/html')) {
      return caches.open(PAGES_CACHE).then(cache => cache.match(OFFLINE_PAGE))
    }

    return new Response('', {
      status: 404,
      statusText: 'Resource not found'
    })
  }
}

// ==================== 工具函数 ====================

// 判断是否为图片请求
function isImageRequest(request) {
  return request.headers.get('Accept')?.includes('image/') ||
         /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(request.url)
}

// 判断是否为页面请求
function isPageRequest(request) {
  return request.method === 'GET' &&
         request.headers.get('Accept')?.includes('text/html')
}

// 判断是否为 API 请求（使用配置中的端点）
function isApiRequest(url) {
  return url.includes(ENDPOINTS.API_PREFIX)
}

// 判断是否为需要缓存的 API 端点
function isCacheableApiEndpoint(url) {
  return API_ENDPOINTS.some(endpoint => url.includes(endpoint))
}

// 后台同步处理
async function handleBackgroundSync() {
  console.log('[SW] 执行后台同步')

  try {
    // 获取待同步的数据
    const pendingData = await getStoredData('pending-sync')

    if (pendingData && pendingData.length > 0) {
      // 逐个处理待同步数据
      for (const item of pendingData) {
        await syncDataItem(item)
      }

      // 清空待同步队列
      await clearStoredData('pending-sync')

      // 通知客户端同步完成
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETED',
            count: pendingData.length
          })
        })
      })
    }
  } catch (error) {
    console.error('[SW] 后台同步失败:', error)
  }
}

// 同步单个数据项
async function syncDataItem(item) {
  try {
    const response = await fetch(item.url, {
      method: item.method,
      headers: item.headers,
      body: item.data
    })

    if (!response.ok) {
      throw new Error(`同步失败: ${response.status}`)
    }

    console.log('[SW] 数据项同步成功:', item.id)
  } catch (error) {
    console.error('[SW] 数据项同步失败:', item.id, error)
    throw error
  }
}

// 显示通知
async function showNotification(data) {
  const options = {
    body: data.body || '您有新消息',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/badge-72.png',
    image: data.image,
    tag: data.tag || 'default',
    renotify: data.renotify || false,
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'view',
        title: '查看',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: '忽略',
        icon: '/icons/action-dismiss.png'
      }
    ],
    data: data.data || {}
  }

  return self.registration.showNotification(
    data.title || '幼儿园管理系统',
    options
  )
}

// 获取存储的数据
async function getStoredData(key) {
  try {
    const cache = await caches.open('data-storage')
    const response = await cache.match(`/storage/${key}`)

    if (response) {
      return response.json()
    }

    return null
  } catch (error) {
    console.error('[SW] 获取存储数据失败:', error)
    return null
  }
}

// 清空存储的数据
async function clearStoredData(key) {
  try {
    const cache = await caches.open('data-storage')
    await cache.delete(`/storage/${key}`)
  } catch (error) {
    console.error('[SW] 清空存储数据失败:', error)
  }
}

// ==================== 缓存管理 ====================

// 定期清理过期缓存
async function cleanupExpiredCache() {
  const maxAge = 7 * 24 * 60 * 60 * 1000 // 7天
  const now = Date.now()

  try {
    const cacheNames = await caches.keys()

    for (const cacheName of cacheNames) {
      if (cacheName.includes(IMAGES_CACHE)) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()

        for (const request of keys) {
          const response = await cache.match(request)
          const cacheTime = response.headers.get('sw-cache-time')

          if (cacheTime && (now - parseInt(cacheTime)) > maxAge) {
            console.log('[SW] 清理过期缓存:', request.url)
            await cache.delete(request)
          }
        }
      }
    }
  } catch (error) {
    console.error('[SW] 清理缓存失败:', error)
  }
}

// 定期执行缓存清理
setInterval(cleanupExpiredCache, 24 * 60 * 60 * 1000) // 每24小时执行一次

console.log('[SW] Service Worker 模板加载完成')