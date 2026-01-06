import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

// 创建axios实例
const api = axios.create({
  baseURL: window.apiBaseURL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()

    // 添加认证token
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    console.log(`📤 API请求: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API响应: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    return response
  },
  async (error) => {
    const authStore = useAuthStore()

    console.error('API响应错误:', error)

    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // 未授权，清除登录状态并跳转到登录页
          ElMessage.error('登录已过期，请重新登录')
          await authStore.logout()

          // 在Electron环境中不跳转，而是在当前页面显示登录
          if (window.electronAPI) {
            window.location.hash = '/login'
          } else {
            window.location.href = '/login'
          }
          break

        case 403:
          ElMessage.error('权限不足，无法访问')
          break

        case 404:
          ElMessage.error('请求的资源不存在')
          break

        case 422:
          // 表单验证错误
          if (data.errors && typeof data.errors === 'object') {
            const firstError = Object.values(data.errors)[0]
            ElMessage.error(Array.isArray(firstError) ? firstError[0] : firstError)
          } else {
            ElMessage.error(data.message || '请求参数错误')
          }
          break

        case 429:
          ElMessage.error('请求过于频繁，请稍后再试')
          break

        case 500:
          ElMessage.error('服务器内部错误，请稍后再试')
          break

        default:
          ElMessage.error(data.message || '请求失败')
      }
    } else if (error.request) {
      // 网络错误
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      // 其他错误
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

// 请求方法封装
const request = {
  get(url, params = {}) {
    return api.get(url, { params })
  },

  post(url, data = {}) {
    return api.post(url, data)
  },

  put(url, data = {}) {
    return api.put(url, data)
  },

  patch(url, data = {}) {
    return api.patch(url, data)
  },

  delete(url) {
    return api.delete(url)
  },

  // 文件上传
  upload(url, formData, onProgress) {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    })
  },

  // 下载文件
  download(url, params = {}) {
    return api.get(url, {
      params,
      responseType: 'blob'
    })
  }
}

// 设置API基础URL
export const setApiBaseURL = (url) => {
  api.defaults.baseURL = url
}

export { api, request }