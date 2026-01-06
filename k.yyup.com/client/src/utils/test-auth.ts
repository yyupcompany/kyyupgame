/**
 * 认证测试工具
 * 用于调试token携带问题
 */

export function checkAuthToken() {
  const tokens = {
    kindergarten_token: localStorage.getItem('kindergarten_token'),
    token: localStorage.getItem('kindergarten_token'),
    auth_token: localStorage.getItem('auth_token')
  }
  
  console.log('🔍 [认证调试] 本地存储的token:')
  console.log('  kindergarten_token:', tokens.kindergarten_token ? tokens.kindergarten_token.substring(0, 30) + '...' : '❌ 不存在')
  console.log('  token:', tokens.token ? tokens.token.substring(0, 30) + '...' : '❌ 不存在')
  console.log('  auth_token:', tokens.auth_token ? tokens.auth_token.substring(0, 30) + '...' : '❌ 不存在')
  
  const activeToken = tokens.kindergarten_token || tokens.token || tokens.auth_token
  
  if (activeToken) {
    console.log('✅ [认证调试] 找到有效token:', activeToken.substring(0, 30) + '...')
    
    // 解析JWT token
    try {
      const parts = activeToken.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]))
        console.log('📋 [认证调试] Token payload:', payload)
        
        // 检查过期时间
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000)
          const now = new Date()
          const isExpired = expDate < now
          
          console.log('⏰ [认证调试] Token过期时间:', expDate.toLocaleString())
          console.log('⏰ [认证调试] 当前时间:', now.toLocaleString())
          console.log(isExpired ? '❌ [认证调试] Token已过期' : '✅ [认证调试] Token有效')
        }
      }
    } catch (e) {
      console.error('❌ [认证调试] 解析token失败:', e)
    }
  } else {
    console.error('❌ [认证调试] 没有找到任何token')
  }
  
  return activeToken
}

export function testAuthRequest() {
  const token = checkAuthToken()
  
  if (!token) {
    console.error('❌ [认证测试] 无法测试，没有token')
    return
  }
  
  console.log('🧪 [认证测试] 开始测试配音API认证...')
  
  // 测试请求
  fetch('/api/ai/text-to-speech/config', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      console.log('📡 [认证测试] 响应状态:', response.status)
      console.log('📡 [认证测试] 响应头:', Object.fromEntries(response.headers.entries()))
      
      if (response.status === 403) {
        console.error('❌ [认证测试] 403错误 - 认证失败')
      } else if (response.status === 401) {
        console.error('❌ [认证测试] 401错误 - 未授权')
      } else if (response.status === 200) {
        console.log('✅ [认证测试] 认证成功')
      }
      
      return response.json()
    })
    .then(data => {
      console.log('📦 [认证测试] 响应数据:', data)
    })
    .catch(error => {
      console.error('❌ [认证测试] 请求失败:', error)
    })
}

