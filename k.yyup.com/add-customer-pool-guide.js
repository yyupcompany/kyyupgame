import axios from 'axios';

// 客户池中心页面说明文档
const customerPoolGuide = {
  pagePath: '/centers/customer-pool',
  pageName: '客户池中心',
  pageDescription: '客户池中心是幼儿园招生管理的核心平台，专门用于管理潜在客户信息、跟进客户状态、分析客户数据和提高转化率。这里汇集了所有潜在家长的信息，包括客户来源、跟进记录、转化状态等，为招生团队提供全面的客户管理和数据分析功能。主要功能包括：\n\n1. **客户统计概览**：显示总客户数、本月新增、未分配客户、本月转化等关键指标\n2. **客户管理**：查看、编辑、删除客户信息，支持批量操作\n3. **跟进记录**：记录和查看客户跟进历史，包括电话、微信、面谈等方式\n4. **数据分析**：客户转化趋势、来源分析、跟进效果等数据可视化\n5. **智能分配**：根据规则自动或手动分配客户给招生老师\n6. **导入导出**：支持批量导入客户数据和导出统计报表',
  category: '中心页面',
  importance: 9,
  relatedTables: ['parents', 'parent_followups', 'enrollment_applications', 'users'],
  contextPrompt: '用户正在客户池中心页面，这是招生管理的核心平台。用户可能需要查看客户统计、管理客户信息、跟进客户状态、分析转化数据等。请提供专业的客户管理和招生转化建议，包括如何提高转化率、优化跟进流程、分析客户行为等。',
  isActive: true
};

async function addCustomerPoolGuide() {
  try {
    console.log('🔄 开始添加客户池中心页面说明文档...');
    
    const response = await axios.post('http://localhost:3000/api/page-guides', customerPoolGuide, {
      headers: {
        'Content-Type': 'application/json',
        // 使用一个简单的token，实际应该从登录获取
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzUwMzQ4NDMsImV4cCI6MTczNTEyMTI0M30.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'
      },
      timeout: 10000
    });
    
    console.log('✅ 客户池中心页面说明文档添加成功:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ API错误:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ 网络错误:', error.message);
    } else {
      console.error('❌ 其他错误:', error.message);
    }
  }
}

// 执行添加操作
addCustomerPoolGuide();
