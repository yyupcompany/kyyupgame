#!/usr/bin/env node

/**
 * 测试admin登录API响应
 */

import { authAPI } from './src/api/modules/auth.js'

async function testAdminLogin() {
  console.log('测试admin登录...')

  try {
    const response = await authAPI.login({
      username: 'admin',
      password: '123456'
    })

    console.log('响应状态:', response.success ? '成功' : '失败')
    console.log('响应数据:', JSON.stringify(response.data, null, 2))

    if (response.data) {
      console.log('\n关键字段:')
      console.log('- token:', !!response.data.token)
      console.log('- user:', !!response.data.user)
      console.log('- role:', response.data.role || response.data.user?.role)
      console.log('- roles:', response.data.roles || response.data.user?.roles)
    }
  } catch (error) {
    console.error('登录失败:', error.message)
  }
}

testAdminLogin()
