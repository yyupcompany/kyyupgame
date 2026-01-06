const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

async function checkPrincipalPaths() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 检查园长(principal)的路径权限');
  console.log('='.repeat(70) + '\n');

  try {
    // 登录principal
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'principal',
      password: '123456'
    });

    const authToken = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log(`✅ 登录成功: ${user.username} (角色: ${user.role || 'principal'})\n`);

    // 获取动态路由
    const routesResponse = await axios.get(
      `${API_BASE_URL}/dynamic-permissions/dynamic-routes`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );

    const data = routesResponse.data.data;
    const routes = data.routes || [];
    
    // 按路径前缀分类
    const byPrefix = {
      '/centers/': [],
      '/teacher-center/': [],
      '/parent-center': [],
      'other': []
    };
    
    routes.forEach(route => {
      const path = route.path || '';
      const name = route.chinese_name || route.name;
      
      if (path.startsWith('/centers/')) {
        byPrefix['/centers/'].push({ name, path });
      } else if (path.startsWith('/teacher-center/')) {
        byPrefix['/teacher-center/'].push({ name, path });
      } else if (path.startsWith('/parent-center')) {
        byPrefix['/parent-center'].push({ name, path });
      } else if (name && (name.includes('Center') || name.includes('中心'))) {
        byPrefix['other'].push({ name, path });
      }
    });
    
    console.log('📊 路径分类统计:\n');
    console.log(`  /centers/* : ${byPrefix['/centers/'].length}个 ✅ (管理层)`);
    console.log(`  /teacher-center/* : ${byPrefix['/teacher-center/'].length}个 ${byPrefix['/teacher-center/'].length > 0 ? '⚠️' : '✅'} (教师层)`);
    console.log(`  /parent-center : ${byPrefix['/parent-center'].length}个 ${byPrefix['/parent-center'].length > 0 ? '⚠️' : '✅'} (家长层)`);
    console.log(`  其他 : ${byPrefix['other'].length}个\n`);
    
    console.log('=' .repeat(70));
    console.log('📋 /centers/* 管理层中心列表:\n');
    
    byPrefix['/centers/'].forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name}`);
      console.log(`     路径: ${item.path}\n`);
    });
    
    if (byPrefix['/teacher-center/'].length > 0) {
      console.log('=' .repeat(70));
      console.log('⚠️  /teacher-center/* 教师层中心列表 (园长不应该有):\n');
      
      byPrefix['/teacher-center/'].forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name}`);
        console.log(`     路径: ${item.path}\n`);
      });
    }
    
    if (byPrefix['/parent-center'].length > 0) {
      console.log('=' .repeat(70));
      console.log('⚠️  /parent-center 家长层中心 (园长不应该有):\n');
      
      byPrefix['/parent-center'].forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.name}`);
        console.log(`     路径: ${item.path}\n`);
      });
    }
    
    console.log('=' .repeat(70));
    console.log('�� 验证结果:\n');
    
    const hasSystemCenter = byPrefix['/centers/'].some(item => 
      item.name.includes('System Center') || item.name.includes('系统中心')
    );
    
    console.log(`  系统中心 (System Center): ${hasSystemCenter ? '❌ 有 (错误)' : '✅ 无 (正确)'}`);
    console.log(`  教师层路径 (/teacher-center/*): ${byPrefix['/teacher-center/'].length > 0 ? '❌ 有 (错误)' : '✅ 无 (正确)'}`);
    console.log(`  家长层路径 (/parent-center): ${byPrefix['/parent-center'].length > 0 ? '❌ 有 (错误)' : '✅ 无 (正确)'}`);
    console.log(`  管理层路径 (/centers/*): ${byPrefix['/centers/'].length > 0 ? '✅ 有 (正确)' : '❌ 无 (错误)'}`);
    
    console.log('\n' + '=' .repeat(70));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response) {
      console.error('响应:', error.response.status, error.response.data);
    }
  }
}

checkPrincipalPaths();
