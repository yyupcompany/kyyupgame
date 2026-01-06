/**
 * 单独测试每个侧边栏API端点
 */

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjI5ODQ0NTMsImV4cCI6MTc2MzA3MDg1M30.EdYA5KV-5I0pWaMoCTUeD7sEb6wVnhytVG-0sJALSGY';

// 需要测试的API端点（按优先级排序）
const priorityAPIs = [
  { name: '业务中心', endpoint: '/api/business', category: '业务管理' },
  { name: '教学中心', endpoint: '/api/teaching', category: '教学管理' },
  { name: '检查中心', endpoint: '/api/inspection-plans', category: '教学管理' },
  { name: '考勤中心', endpoint: '/api/attendance', category: '教学管理' },
  { name: '财务中心', endpoint: '/api/finance', category: '财务管理' },
  { name: '绩效中心', endpoint: '/api/performance-rules', category: '财务管理' },
  { name: '人员中心', endpoint: '/api/personnel', category: '人员管理' }
];

async function testSingleAPI(name, endpoint) {
  console.log(`🧪 测试 ${name}: ${endpoint}`);

  try {
    const response = await fetch(`http://localhost:3000${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`状态码: ${response.status} ${response.statusText}`);

    if (response.ok) {
      try {
        const data = await response.json();
        console.log('✅ 成功 - 响应数据:', typeof data === 'object' ? `${JSON.stringify(data).substring(0, 200)}...` : data.substring(0, 200));
        return { success: true, data };
      } catch (parseError) {
        const text = await response.text();
        console.log('✅ 成功 - 响应文本:', text.substring(0, 200) + '...');
        return { success: true, data: text };
      }
    } else {
      try {
        const errorData = await response.json();
        console.log('❌ 失败 - 错误信息:', errorData);
        return { success: false, error: errorData };
      } catch (parseError) {
        const errorText = await response.text();
        console.log('❌ 失败 - 错误文本:', errorText);
        return { success: false, error: errorText };
      }
    }

  } catch (error) {
    console.log('❌ 请求失败:', error.message);
    return { success: false, error: error.message };
  }
}

async function testPriorityAPIs() {
  console.log('🔧 开始测试优先级API端点...\n');

  const results = [];

  for (const api of priorityAPIs) {
    const result = await testSingleAPI(api.name, api.endpoint);
    results.push({ ...api, ...result });
    console.log('---');
  }

  console.log('\n📊 测试结果汇总:');
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;

  console.log(`总计: ${results.length} 个API端点`);
  console.log(`成功: ${successCount} 个`);
  console.log(`失败: ${failCount} 个`);

  if (failCount > 0) {
    console.log('\n❌ 失败的API端点:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.endpoint}`);
      if (r.error) {
        console.log(`    错误: ${typeof r.error === 'object' ? JSON.stringify(r.error) : r.error}`);
      }
    });
  }

  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  testPriorityAPIs()
    .then((results) => {
      console.log('\n🎉 优先级API测试完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testSingleAPI, testPriorityAPIs };