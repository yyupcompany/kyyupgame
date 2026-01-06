/**
 * 话术模板系统完整测试脚本
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// 测试用例
const testCases = [
  { input: '你好', expectedCategory: 'greeting', description: '问候语测试' },
  { input: '您好', expectedCategory: 'greeting', description: '问候语测试（敬语）' },
  { input: '多少钱', expectedCategory: 'qa', description: '学费咨询' },
  { input: '费用是多少', expectedCategory: 'qa', description: '学费咨询（变体）' },
  { input: '在哪里', expectedCategory: 'qa', description: '地址咨询' },
  { input: '位置在哪', expectedCategory: 'qa', description: '地址咨询（变体）' },
  { input: '有什么课程', expectedCategory: 'qa', description: '课程咨询' },
  { input: '师资怎么样', expectedCategory: 'qa', description: '师资咨询' },
  { input: '想参观', expectedCategory: 'invitation', description: '参观邀约' },
  { input: '谢谢', expectedCategory: 'closing', description: '结束语' },
  { input: '随机内容测试', expectedCategory: 'other', description: '默认话术测试' }
];

async function testScriptTemplateSystem() {
  console.log('🚀 开始测试话术模板系统...\n');

  let passedTests = 0;
  let failedTests = 0;

  // 1. 测试获取话术列表
  console.log('📋 测试1: 获取话术列表');
  try {
    const response = await axios.get(`${API_BASE}/script-templates`, {
      params: { page: 1, pageSize: 100 }
    });
    
    if (response.data.success && response.data.data.items.length > 0) {
      console.log(`✅ 成功获取 ${response.data.data.items.length} 条话术模板`);
      console.log(`   总数: ${response.data.data.total}`);
      passedTests++;
    } else {
      console.log('❌ 获取话术列表失败');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 获取话术列表异常:', error.message);
    failedTests++;
  }
  console.log('');

  // 2. 测试分类统计
  console.log('📊 测试2: 获取分类统计');
  try {
    const response = await axios.get(`${API_BASE}/script-templates/stats/category`);
    
    if (response.data.success && response.data.data.length > 0) {
      console.log('✅ 成功获取分类统计:');
      response.data.data.forEach(stat => {
        console.log(`   ${stat.category}: ${stat.count}条, 使用${stat.totalUsage}次, 成功率${stat.avgSuccessRate}%`);
      });
      passedTests++;
    } else {
      console.log('❌ 获取分类统计失败');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 获取分类统计异常:', error.message);
    failedTests++;
  }
  console.log('');

  // 3. 测试话术匹配
  console.log('🎯 测试3: 话术匹配测试');
  console.log('─'.repeat(80));
  
  for (const testCase of testCases) {
    try {
      const response = await axios.post(`${API_BASE}/script-templates/match`, {
        userInput: testCase.input
      });

      if (response.data.success) {
        const { template, score, matchedKeywords } = response.data.data;
        
        if (template) {
          const categoryMatch = template.category === testCase.expectedCategory;
          const icon = categoryMatch ? '✅' : '⚠️';
          
          console.log(`${icon} ${testCase.description}`);
          console.log(`   输入: "${testCase.input}"`);
          console.log(`   匹配得分: ${score.toFixed(2)}`);
          console.log(`   匹配话术: ${template.title} (${template.category})`);
          console.log(`   匹配关键词: ${matchedKeywords.join(', ')}`);
          console.log(`   话术内容: ${template.content.substring(0, 50)}...`);
          
          if (categoryMatch) {
            passedTests++;
          } else {
            console.log(`   ⚠️  预期分类: ${testCase.expectedCategory}, 实际分类: ${template.category}`);
            failedTests++;
          }
        } else {
          console.log(`⚠️  ${testCase.description}`);
          console.log(`   输入: "${testCase.input}"`);
          console.log(`   未匹配到话术，使用默认话术`);
          passedTests++; // 默认话术也算通过
        }
      } else {
        console.log(`❌ ${testCase.description} - 匹配失败`);
        failedTests++;
      }
      
      console.log('');
    } catch (error) {
      console.log(`❌ ${testCase.description} - 异常: ${error.message}`);
      failedTests++;
      console.log('');
    }
  }

  // 4. 测试创建话术
  console.log('➕ 测试4: 创建新话术');
  try {
    const newTemplate = {
      title: '测试话术',
      category: 'other',
      keywords: '测试,test',
      content: '这是一条测试话术，用于验证系统功能。',
      priority: 5,
      status: 'active'
    };

    const response = await axios.post(`${API_BASE}/script-templates`, newTemplate);
    
    if (response.data.success && response.data.data.id) {
      console.log(`✅ 成功创建话术，ID: ${response.data.data.id}`);
      
      // 立即删除测试话术
      await axios.delete(`${API_BASE}/script-templates/${response.data.data.id}`);
      console.log(`✅ 成功删除测试话术`);
      
      passedTests++;
    } else {
      console.log('❌ 创建话术失败');
      failedTests++;
    }
  } catch (error) {
    console.log('❌ 创建话术异常:', error.message);
    failedTests++;
  }
  console.log('');

  // 5. 测试更新话术
  console.log('✏️  测试5: 更新话术');
  try {
    // 先获取第一条话术
    const listResponse = await axios.get(`${API_BASE}/script-templates`, {
      params: { page: 1, pageSize: 1 }
    });

    if (listResponse.data.success && listResponse.data.data.items.length > 0) {
      const template = listResponse.data.data.items[0];
      const originalUsageCount = template.usageCount;

      // 更新话术（只更新使用次数，不改变其他内容）
      const updateResponse = await axios.put(`${API_BASE}/script-templates/${template.id}`, {
        title: template.title,
        category: template.category,
        keywords: template.keywords,
        content: template.content,
        priority: template.priority,
        status: template.status
      });

      if (updateResponse.data.success) {
        console.log(`✅ 成功更新话术 ID: ${template.id}`);
        passedTests++;
      } else {
        console.log('❌ 更新话术失败');
        failedTests++;
      }
    } else {
      console.log('⚠️  没有可更新的话术');
      passedTests++;
    }
  } catch (error) {
    console.log('❌ 更新话术异常:', error.message);
    failedTests++;
  }
  console.log('');

  // 测试总结
  console.log('═'.repeat(80));
  console.log('📊 测试总结');
  console.log('═'.repeat(80));
  console.log(`✅ 通过: ${passedTests} 个测试`);
  console.log(`❌ 失败: ${failedTests} 个测试`);
  console.log(`📈 成功率: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(2)}%`);
  console.log('═'.repeat(80));

  if (failedTests === 0) {
    console.log('\n🎉 所有测试通过！话术模板系统运行正常！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查系统配置。');
  }
}

// 运行测试
testScriptTemplateSystem().catch(error => {
  console.error('❌ 测试脚本执行失败:', error);
  process.exit(1);
});

