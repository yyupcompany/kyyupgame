/**
 * Service Worker 功能测试脚本
 *
 * 测试修复后的 Service Worker 配置是否正常工作
 */

const fs = require('fs')
const path = require('path')

// 模拟 Service Worker 环境
global.self = {
  addEventListener: function(event, callback) {
    console.log(`📝 注册事件监听器: ${event}`)
  },
  skipWaiting: function() {
    return Promise.resolve()
  },
  clients: {
    claim: function() {
      return Promise.resolve()
    },
    matchAll: function() {
      return Promise.resolve([])
    }
  },
  registration: {
    showNotification: function(title, options) {
      console.log(`📢 显示通知: ${title}`)
      return Promise.resolve()
    }
  }
}

// 模拟 caches API
global.caches = {
  open: function(name) {
    return Promise.resolve({
      addAll: function() {
        return Promise.resolve()
      },
      add: function() {
        return Promise.resolve()
      },
      keys: function() {
        return Promise.resolve([])
      },
      match: function() {
        return Promise.resolve(null)
      },
      put: function() {
        return Promise.resolve()
      },
      delete: function() {
        return Promise.resolve(true)
      }
    })
  },
  keys: function() {
    return Promise.resolve([])
  },
  delete: function() {
    return Promise.resolve(true)
  }
}

// 模拟 fetch API
global.fetch = function(url, options) {
  return Promise.resolve({
    ok: true,
    clone: function() {
      return this
    },
    headers: {
      get: function(name) {
        return name === 'Accept' ? 'application/json' : null
      }
    }
  })
}

// 模拟 console
global.console = console

// 测试 Service Worker
function testServiceWorker() {
  console.log('🧪 开始测试 Service Worker 功能...')

  const swPath = path.resolve(__dirname, 'sw.js')
  const swContent = fs.readFileSync(swPath, 'utf8')

  try {
    // 执行 Service Worker 代码
    eval(swContent)

    console.log('✅ Service Worker 加载成功')

    // 测试配置对象
    if (typeof API_CONFIG !== 'undefined') {
      console.log('✅ API_CONFIG 对象可用')
      console.log(`   API_PREFIX: ${API_CONFIG.API_PREFIX}`)
      console.log(`   AUTH.USER: ${API_CONFIG.AUTH.USER}`)
      console.log(`   DASHBOARD.STATS: ${API_CONFIG.DASHBOARD.STATS}`)
    } else {
      console.log('❌ API_CONFIG 对象不可用')
      return false
    }

    // 测试 API_ENDPOINTS 数组
    if (typeof API_ENDPOINTS !== 'undefined') {
      console.log('✅ API_ENDPOINTS 数组可用')
      console.log(`   端点数量: ${API_ENDPOINTS.length}`)
      API_ENDPOINTS.forEach((endpoint, index) => {
        console.log(`   [${index}] ${endpoint}`)
      })
    } else {
      console.log('❌ API_ENDPOINTS 数组不可用')
      return false
    }

    // 测试工具函数
    if (typeof isCacheableApiEndpoint !== 'undefined') {
      console.log('✅ isCacheableApiEndpoint 函数可用')

      // 测试函数
      const testUrl1 = API_CONFIG.AUTH.USER
      const testUrl2 = '/api/unknown/endpoint'

      console.log(`   测试1: ${testUrl1} -> ${isCacheableApiEndpoint(testUrl1)}`)
      console.log(`   测试2: ${testUrl2} -> ${isCacheableApiEndpoint(testUrl2)}`)
    } else {
      console.log('❌ isCacheableApiEndpoint 函数不可用')
      return false
    }

    console.log('🎉 所有测试通过！')
    return true

  } catch (error) {
    console.error('❌ Service Worker 测试失败:', error.message)
    return false
  }
}

// 运行测试
const success = testServiceWorker()
process.exit(success ? 0 : 1)