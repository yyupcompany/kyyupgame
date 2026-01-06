/**
 * 测试所有侧边栏对应的API端点
 */

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjI5ODQ0NTMsImV4cCI6MTc2MzA3MDg1M30.EdYA5KV-5I0pWaMoCTUeD7sEb6wVnhytVG-0sJALSGY';

// 侧边栏API端点映射
const sidebarEndpoints = [
  // 业务管理
  { category: '业务管理', name: '业务中心', endpoint: '/api/business', center: 'business' },
  { category: '业务管理', name: '招生中心', endpoint: '/api/enrollment-plans', center: 'enrollment' },
  { category: '业务管理', name: '活动中心', endpoint: '/api/activities', center: 'activity' },

  // 教学管理
  { category: '教学管理', name: '教学中心', endpoint: '/api/teaching', center: 'teaching' },
  { category: '教学管理', name: '测评中心', endpoint: '/api/assessments', center: 'assessment' },
  { category: '教学管理', name: '检查中心', endpoint: '/api/inspection-plans', center: 'inspection' },
  { category: '教学管理', name: '考勤中心', endpoint: '/api/attendance', center: 'attendance' },
  { category: '教学管理', name: '相册中心', endpoint: '/api/photo-albums', center: 'photo-album' },

  // 营销管理
  { category: '营销管理', name: '营销中心', endpoint: '/api/marketing-campaigns', center: 'marketing' },
  { category: '营销管理', name: '呼叫中心', endpoint: '/api/call-center', center: 'call' },
  { category: '营销管理', name: '客户池中心', endpoint: '/api/customer-pool', center: 'customer-pool' },
  { category: '营销管理', name: '话术中心', endpoint: '/api/scripts', center: 'script' },

  // 财务管理
  { category: '财务管理', name: '财务中心', endpoint: '/api/finance', center: 'finance' },
  { category: '财务管理', name: '绩效中心', endpoint: '/api/performance-rules', center: 'performance' },
  { category: '财务管理', name: '分析中心', endpoint: '/api/analytics', center: 'analytics' },

  // 人员管理
  { category: '人员管理', name: '人员中心', endpoint: '/api/personnel', center: 'personnel' },
  { category: '人员管理', name: '任务中心', endpoint: '/api/todos', center: 'task' },
  { category: '人员管理', name: '反馈中心', endpoint: '/api/feedback', center: 'feedback' },

  // 系统管理
  { category: '系统管理', name: '系统中心', endpoint: '/api/system', center: 'system' },
  { category: '系统管理', name: '文档模板中心', endpoint: '/api/document-templates', center: 'document-template' },
  { category: '系统管理', name: '用量中心', endpoint: '/api/usage', center: 'usage' }
];

async function testSidebarAPIs() {
  console.log('🔧 开始测试所有侧边栏API端点...\n');

  const results = [];

  for (const api of sidebarEndpoints) {
    console.log(`🧪 测试 ${api.category} - ${api.name}: ${api.endpoint}`);

    try {
      const response = await fetch(`http://localhost:3000${api.endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const status = response.status;
      const statusText = response.statusText;
      let data;

      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }

      const result = {
        ...api,
        status,
        statusText,
        success: status >= 200 && status < 300,
        data: typeof data === 'object' ? JSON.stringify(data).substring(0, 100) + '...' : data.substring(0, 100) + '...'
      };

      results.push(result);

      if (result.success) {
        console.log(`✅ ${status} - 成功`);
      } else {
        console.log(`❌ ${status} ${statusText} - 失败`);
        if (typeof data === 'object' && data.error) {
          console.log(`   错误: ${data.error} - ${data.message || ''}`);
        }
      }

    } catch (error) {
      console.log(`❌ 请求失败 - ${error.message}`);
      results.push({
        ...api,
        status: 'ERROR',
        statusText: 'Request Failed',
        success: false,
        data: error.message
      });
    }

    console.log('---');
  }

  // 汇总结果
  console.log('\n📊 测试结果汇总:');
  console.log('='.repeat(80));

  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;

  console.log(`总计: ${results.length} 个API端点`);
  console.log(`成功: ${successCount} 个`);
  console.log(`失败: ${failCount} 个`);

  if (failCount > 0) {
    console.log('\n❌ 失败的API端点:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.category} - ${r.name}: ${r.endpoint} (${r.status})`);
    });
  }

  // 按类别分组显示
  console.log('\n📋 按类别分类结果:');
  const categories = [...new Set(results.map(r => r.category))];

  categories.forEach(category => {
    console.log(`\n${category}:`);
    const categoryResults = results.filter(r => r.category === category);
    categoryResults.forEach(r => {
      const status = r.success ? '✅' : '❌';
      console.log(`  ${status} ${r.name}: ${r.endpoint} (${r.status})`);
    });
  });

  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  testSidebarAPIs()
    .then((results) => {
      console.log('\n🎉 侧边栏API测试完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testSidebarAPIs, sidebarEndpoints };