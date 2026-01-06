// 通过API添加仪表板中心页面说明文档
const axios = require('axios');

async function addViaAPI() {
  try {
    console.log('🚀 通过API添加仪表板中心页面说明文档...');
    
    // 后端服务器地址
    const baseURL = 'http://localhost:3000/api';
    
    // 页面说明文档数据
    const pageGuideData = {
      pagePath: '/centers/dashboard',
      pageName: '仪表板中心',
      pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
      category: '中心页面',
      importance: 9,
      relatedTables: ['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics'],
      contextPrompt: '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
      isActive: true
    };

    console.log('📝 发送POST请求到:', `${baseURL}/page-guides`);
    console.log('📋 数据:', JSON.stringify(pageGuideData, null, 2));

    // 发送POST请求
    const response = await axios.post(`${baseURL}/page-guides`, pageGuideData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ API响应成功!');
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));

    // 验证数据是否添加成功
    console.log('🔍 验证数据...');
    const verifyResponse = await axios.get(`${baseURL}/page-guides/by-path/${encodeURIComponent('/centers/dashboard')}`, {
      timeout: 5000
    });

    if (verifyResponse.data.success) {
      console.log('✅ 验证成功! 页面说明文档已存在');
      console.log('验证数据:', JSON.stringify(verifyResponse.data.data, null, 2));
      console.log('🎉 现在刷新页面，404错误应该消失了！');
    } else {
      console.log('❌ 验证失败:', verifyResponse.data.message);
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求失败，可能是服务器未启动或网络问题');
      console.error('请确保后端服务器正在运行在 http://localhost:3000');
    } else {
      console.error('请求配置错误:', error.message);
    }
  }
}

// 执行脚本
addViaAPI();
