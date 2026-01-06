/**
 * 测试实际注册的API路由
 */

const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMSwidXNlcm5hbWUiOiJhZG1pbiIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NjI5ODQ0NTMsImV4cCI6MTc2MzA3MDg1M30.EdYA5KV-5I0pWaMoCTUeD7sEb6wVnhytVG-0sJALSGY';

// 基于路由文件中实际注册的路径
const actualRoutes = [
  // 业务管理
  { name: '业务中心', path: '/business-center', category: '业务管理' },
  { name: '招生中心', path: '/enrollment-center', category: '业务管理' },
  { name: '活动中心', path: '/activities', category: '业务管理' },

  // 教学管理
  { name: '教学中心', path: '/teaching-center', category: '教学管理' },
  { name: '测评中心', path: '/assessment', category: '教学管理' },
  { name: '检查中心', path: '/inspection', category: '教学管理' },
  { name: '考勤中心', path: '/attendance', category: '教学管理' },
  { name: '相册中心', path: '/media-center', category: '教学管理' },

  // 营销管理
  { name: '营销中心', path: '/marketing-center', category: '营销管理' },
  { name: '呼叫中心', path: '/call-center', category: '营销管理' },
  { name: '客户池中心', path: '/customer-pool', category: '营销管理' },
  { name: '话术中心', path: '/scripts', category: '营销管理' },

  // 财务管理
  { name: '财务中心', path: '/finance', category: '财务管理' },
  { name: '绩效中心', path: '/performance/rules', category: '财务管理' },
  { name: '分析中心', path: '/statistics', category: '财务管理' },

  // 人员管理
  { name: '人员中心', path: '/personnel-center', category: '人员管理' },
  { name: '任务中心', path: '/todos', category: '人员管理' },
  { name: '反馈中心', path: '/feedback', category: '人员管理' },

  // 系统管理
  { name: '系统中心', path: '/system', category: '系统管理' },
  { name: '文档模板中心', path: '/document-templates', category: '系统管理' },
  { name: '用量中心', path: '/usage', category: '系统管理' }
];

async function testActualRoutes() {
  console.log('🔧 开始测试实际注册的API路由...\n');

  const results = [];

  for (const route of actualRoutes) {
    console.log(`🧪 测试 ${route.category} - ${route.name}: ${route.path}`);

    try {
      const response = await fetch(`http://localhost:3000${route.path}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const status = response.status;
      const statusText = response.statusText;

      let data;
      if (response.ok) {
        try {
          data = await response.json();
          console.log(`✅ ${status} - 成功`);
          if (data.success && data.data) {
            console.log(`   数据: ${JSON.stringify(data.data).substring(0, 100)}...`);
          }
        } catch (parseError) {
          const text = await response.text();
          console.log(`✅ ${status} - 成功 (文本)`);
          console.log(`   数据: ${text.substring(0, 100)}...`);
          data = text;
        }
      } else {
        try {
          const errorData = await response.json();
          console.log(`❌ ${status} ${statusText} - 失败`);
          console.log(`   错误: ${errorData.error || errorData.message || '未知错误'}`);
          data = errorData;
        } catch (parseError) {
          const errorText = await response.text();
          console.log(`❌ ${status} ${statusText} - 失败 (文本)`);
          console.log(`   错误: ${errorText.substring(0, 100)}...`);
          data = errorText;
        }
      }

      results.push({
        ...route,
        status,
        statusText,
        success: response.ok,
        data: typeof data === 'object' ? JSON.stringify(data).substring(0, 100) + '...' : data.substring(0, 100) + '...'
      });

    } catch (error) {
      console.log(`❌ 请求失败 - ${error.message}`);
      results.push({
        ...route,
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
      console.log(`  - ${r.category} - ${r.name}: ${r.path} (${r.status})`);
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
      console.log(`  ${status} ${r.name}: ${r.path} (${r.status})`);
    });
  });

  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  testActualRoutes()
    .then((results) => {
      console.log('\n🎉 实际路由API测试完成!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 测试失败:', error);
      process.exit(1);
    });
}

module.exports = { testActualRoutes, actualRoutes };