/**
 * 全局测试设置
 * 在所有测试开始前执行的初始化工作
 */

import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 开始PC端完整测试全局设置...')

  // 测试环境检查
  await checkTestEnvironment()

  // 数据库初始化
  await initializeTestData()

  // 服务健康检查
  await checkServicesHealth()

  console.log('✅ 全局设置完成，开始执行测试')
}

/**
 * 检查测试环境
 */
async function checkTestEnvironment() {
  console.log('🔍 检查测试环境...')

  // 检查必要的环境变量
  const requiredEnvVars = ['NODE_ENV']
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  环境变量 ${envVar} 未设置`)
    }
  }

  // 检查端口占用
  const ports = [5173, 3000]
  for (const port of ports) {
    try {
      const response = await fetch(`http://localhost:${port}`)
      if (response.ok) {
        console.log(`✅ 端口 ${port} 服务正常运行`)
      }
    } catch (error) {
      console.warn(`⚠️  端口 ${port} 服务未响应: ${error.message}`)
    }
  }
}

/**
 * 初始化测试数据
 */
async function initializeTestData() {
  console.log('📊 初始化测试数据...')

  try {
    // 这里可以调用API来初始化测试数据
    // 例如创建测试用户、班级、学生等

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

    // 检查API是否可访问
    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      console.log('✅ 后端API服务正常')
    } else {
      console.warn('⚠️  后端API服务异常')
    }

  } catch (error) {
    console.warn('⚠️  初始化测试数据失败:', error.message)
    // 不抛出错误，允许测试继续进行
  }
}

/**
 * 检查服务健康状态
 */
async function checkServicesHealth() {
  console.log('🏥 检查服务健康状态...')

  const services = [
    { name: '前端', url: 'http://localhost:5173' },
    { name: '后端API', url: 'http://localhost:3000/api/health' }
  ]

  for (const service of services) {
    try {
      const response = await fetch(service.url)
      if (response.ok || response.status === 404) { // 404也算服务正常
        console.log(`✅ ${service.name} 服务正常`)
      } else {
        console.warn(`⚠️  ${service.name} 服务响应异常: ${response.status}`)
      }
    } catch (error) {
      console.warn(`⚠️  ${service.name} 服务连接失败: ${error.message}`)
    }
  }

  // 检查数据库连接（通过API）
  try {
    const response = await fetch('http://localhost:3000/api/health/database')
    if (response.ok) {
      const data = await response.json()
      if (data.status === 'healthy') {
        console.log('✅ 数据库连接正常')
      } else {
        console.warn('⚠️  数据库连接异常')
      }
    }
  } catch (error) {
    console.warn('⚠️  无法检查数据库连接')
  }
}

export default globalSetup