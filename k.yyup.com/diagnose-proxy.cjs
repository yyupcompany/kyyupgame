// 诊断k.yyup.cc代理配置
const axios = require('axios');

console.log('🔍 诊断k.yyup.cc代理配置...\n');

async function diagnoseProxy() {
  const domain = 'https://k.yyup.cc';
  
  console.log(`📡 目标域名: ${domain}`);
  console.log('开始诊断...\n');

  // 测试1: 根路径（应该返回前端HTML）
  console.log('1️⃣ 测试根路径（前端）...');
  try {
    const response = await axios.get(`${domain}/`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Proxy-Diagnosis-Tool'
      }
    });
    
    console.log(`✅ 状态码: ${response.status}`);
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    
    if (response.data.includes('<!doctype html>')) {
      console.log('✅ 前端页面正常加载');
    } else {
      console.log('❌ 前端页面异常');
    }
  } catch (error) {
    console.log(`❌ 根路径测试失败: ${error.message}`);
  }
  console.log('');

  // 测试2: API健康检查（应该返回JSON）
  console.log('2️⃣ 测试API健康检查...');
  try {
    const response = await axios.get(`${domain}/api/health`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Proxy-Diagnosis-Tool',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 状态码: ${response.status}`);
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    console.log(`📋 响应内容: ${typeof response.data === 'object' ? JSON.stringify(response.data) : response.data.substring(0, 100)}...`);
    
    if (response.data.includes('<!doctype html>')) {
      console.log('❌ API返回了HTML页面 - 代理配置错误！');
      console.log('💡 问题: /api/* 请求被路由到前端，而不是后端服务');
    } else if (typeof response.data === 'object' && response.data.success !== undefined) {
      console.log('✅ API代理配置正确');
    } else {
      console.log('⚠️ API响应格式异常');
    }
  } catch (error) {
    console.log(`❌ API健康检查失败: ${error.message}`);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   响应头: ${JSON.stringify(error.response.headers, null, 2)}`);
    }
  }
  console.log('');

  // 测试3: API登录（应该返回JSON）
  console.log('3️⃣ 测试API登录...');
  try {
    const response = await axios.post(`${domain}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Proxy-Diagnosis-Tool'
      }
    });
    
    console.log(`✅ 登录API状态码: ${response.status}`);
    console.log(`📄 Content-Type: ${response.headers['content-type']}`);
    
    if (response.data && response.data.success) {
      console.log('✅ API代理和后端服务正常');
      console.log(`🔑 获取到Token: ${response.data.data?.token?.substring(0, 20)}...`);
    } else {
      console.log('⚠️ API响应异常');
      console.log(`📋 响应: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`❌ 登录API失败: ${error.message}`);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   Content-Type: ${error.response.headers['content-type']}`);
      
      if (error.response.data && error.response.data.includes('<!doctype html>')) {
        console.log('❌ 登录API也返回了HTML - 代理配置严重错误！');
      }
    }
  }
  console.log('');

  // 测试4: 检查后端服务状态
  console.log('4️⃣ 检查本地后端服务...');
  try {
    const response = await axios.get('http://localhost:3000/api/health', {
      timeout: 5000
    });
    console.log(`✅ 本地后端服务正常运行: ${response.status}`);
    console.log(`📋 后端响应: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.log(`❌ 本地后端服务连接失败: ${error.message}`);
    console.log('💡 建议: 确保后端服务在localhost:3000运行');
  }
  console.log('');

  // 诊断结果
  console.log('📊 诊断结果:');
  console.log('==========================================');
  console.log('');
  console.log('🔧 可能的解决方案:');
  console.log('');
  console.log('1️⃣ 如果API返回HTML页面:');
  console.log('   - 需要配置Nginx代理规则');
  console.log('   - 将 /api/* 请求代理到 http://localhost:3000');
  console.log('   - 其他请求继续走前端静态文件');
  console.log('');
  console.log('2️⃣ Nginx配置示例:');
  console.log('   location /api/ {');
  console.log('       proxy_pass http://localhost:3000;');
  console.log('       proxy_set_header Host $host;');
  console.log('       # ... 其他代理头');
  console.log('   }');
  console.log('');
  console.log('3️⃣ 临时解决方案:');
  console.log('   - 修改前端API配置使用直连后端');
  console.log('   - 或设置CORS允许跨域访问');
  console.log('');
  console.log('4️⃣ 验证步骤:');
  console.log('   - curl https://k.yyup.cc/api/health 应该返回JSON');
  console.log('   - curl https://k.yyup.cc/ 应该返回HTML');

}

diagnoseProxy().catch(console.error);