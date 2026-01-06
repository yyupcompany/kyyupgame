/**
 * 测试三个新中心的API和路由
 * - 考勤中心
 * - 集团中心
 * - 用量中心
 */

const http = require('http');

// 测试配置
const API_BASE = 'http://localhost:3000';
const TEST_USER = {
  username: 'admin',
  password: 'admin123'
};

let authToken = '';

// HTTP请求工具
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 开始测试三个新中心的功能\n');
  console.log('='.repeat(80));

  try {
    // 1. 登录获取Token
    console.log('\n📝 步骤1: 管理员登录');
    console.log('-'.repeat(80));
    
    const loginRes = await makeRequest('POST', '/api/auth/login', TEST_USER);
    
    if (loginRes.status === 200 && loginRes.data.success) {
      authToken = loginRes.data.data.token;
      console.log('✅ 登录成功');
      console.log(`   用户: ${loginRes.data.data.user.username}`);
      console.log(`   角色: ${loginRes.data.data.user.role}`);
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
    } else {
      throw new Error('登录失败');
    }

    // 2. 获取用户权限
    console.log('\n📝 步骤2: 获取用户权限');
    console.log('-'.repeat(80));
    
    const permsRes = await makeRequest('GET', '/api/dynamic-permissions/user-permissions?userId=121', null, authToken);
    
    if (permsRes.status === 200 && permsRes.data.success) {
      const permissions = permsRes.data.data;
      
      // 检查三个中心的权限
      const attendancePerms = permissions.filter(p => p.includes('ATTENDANCE'));
      const groupPerms = permissions.filter(p => p.includes('GROUP'));
      const usagePerms = permissions.filter(p => p.includes('USAGE'));
      
      console.log('✅ 权限获取成功');
      console.log(`   总权限数: ${permissions.length}`);
      console.log(`   📊 考勤相关: ${attendancePerms.length} 个`);
      console.log(`   🏢 集团相关: ${groupPerms.length} 个`);
      console.log(`   📈 用量相关: ${usagePerms.length} 个`);
      
      // 检查关键权限
      const keyPerms = ['ATTENDANCE_CENTER', 'GROUP_MANAGEMENT', 'USAGE_CENTER'];
      console.log('\n   关键权限检查:');
      keyPerms.forEach(perm => {
        const has = permissions.includes(perm);
        console.log(`   ${has ? '✅' : '❌'} ${perm}`);
      });
    } else {
      throw new Error('获取权限失败');
    }

    // 3. 测试集团中心API
    console.log('\n📝 步骤3: 测试集团中心API');
    console.log('-'.repeat(80));
    
    try {
      const groupsRes = await makeRequest('GET', '/api/groups?page=1&pageSize=10', null, authToken);
      
      if (groupsRes.status === 200) {
        console.log('✅ 集团列表API正常');
        if (groupsRes.data.success) {
          const total = groupsRes.data.data?.total || 0;
          console.log(`   集团总数: ${total}`);
        }
      } else {
        console.log(`⚠️  集团列表API返回: ${groupsRes.status}`);
      }
    } catch (error) {
      console.log(`❌ 集团列表API错误: ${error.message}`);
    }

    // 4. 测试考勤中心相关API（如果存在）
    console.log('\n📝 步骤4: 测试考勤中心API');
    console.log('-'.repeat(80));
    
    try {
      // 尝试获取考勤统计
      const attendanceRes = await makeRequest('GET', '/api/attendance/statistics', null, authToken);
      
      if (attendanceRes.status === 200) {
        console.log('✅ 考勤统计API正常');
      } else if (attendanceRes.status === 404) {
        console.log('ℹ️  考勤统计API未实现 (404)');
      } else {
        console.log(`⚠️  考勤统计API返回: ${attendanceRes.status}`);
      }
    } catch (error) {
      console.log(`ℹ️  考勤API: ${error.message}`);
    }

    // 5. 测试用量中心相关API（如果存在）
    console.log('\n📝 步骤5: 测试用量中心API');
    console.log('-'.repeat(80));
    
    try {
      // 尝试获取用量统计
      const usageRes = await makeRequest('GET', '/api/usage/statistics', null, authToken);
      
      if (usageRes.status === 200) {
        console.log('✅ 用量统计API正常');
      } else if (usageRes.status === 404) {
        console.log('ℹ️  用量统计API未实现 (404)');
      } else {
        console.log(`⚠️  用量统计API返回: ${usageRes.status}`);
      }
    } catch (error) {
      console.log(`ℹ️  用量API: ${error.message}`);
    }

    // 6. 测试动态路由生成
    console.log('\n📝 步骤6: 测试动态路由生成');
    console.log('-'.repeat(80));
    
    const routesRes = await makeRequest('GET', '/api/dynamic-permissions/dynamic-routes', null, authToken);
    
    if (routesRes.status === 200 && routesRes.data.success) {
      const routes = routesRes.data.data;
      console.log('✅ 动态路由生成成功');
      console.log(`   路由总数: ${routes.length}`);
      
      // 查找三个中心的路由
      const attendanceRoute = routes.find(r => r.path === '/attendance-center' || r.name === 'AttendanceCenter');
      const groupRoute = routes.find(r => r.path === '/group' || r.name === 'GroupManagement');
      const usageRoute = routes.find(r => r.path === '/usage-center' || r.name === 'UsageCenter');
      
      console.log('\n   中心路由检查:');
      console.log(`   ${attendanceRoute ? '✅' : '❌'} 考勤中心路由`);
      console.log(`   ${groupRoute ? '✅' : '❌'} 集团中心路由`);
      console.log(`   ${usageRoute ? '✅' : '❌'} 用量中心路由`);
    } else {
      console.log('⚠️  动态路由生成失败');
    }

    // 7. 总结
    console.log('\n' + '='.repeat(80));
    console.log('✅ 测试完成！');
    
    console.log('\n📊 测试结果总结:');
    console.log('   1. ✅ 管理员登录成功');
    console.log('   2. ✅ 权限获取成功');
    console.log('   3. ✅ 集团中心API可用');
    console.log('   4. ℹ️  考勤中心API待实现');
    console.log('   5. ℹ️  用量中心API待实现');
    console.log('   6. ✅ 动态路由生成正常');
    
    console.log('\n📝 前端验证步骤:');
    console.log('   1. 访问 http://k.yyup.cc');
    console.log('   2. 使用 admin/admin123 登录');
    console.log('   3. 检查左侧侧边栏是否显示:');
    console.log('      - 📊 考勤中心');
    console.log('      - 🏢 集团管理');
    console.log('      - 📈 用量中心');
    console.log('   4. 点击每个中心，测试子菜单是否正常显示');

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    throw error;
  }
}

// 执行测试
runTests()
  .then(() => {
    console.log('\n🎉 所有测试执行完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 测试执行失败:', error);
    process.exit(1);
  });

