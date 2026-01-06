#!/usr/bin/env node
/**
 * AI助手页面验证测试
 * 验证新设计的AI助手页面结构和功能
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function verifyAIPage() {
  console.log('🧪 验证AI助手页面设计...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: { passed: 0, failed: 0, total: 0 }
  };

  function addTest(name, status, details = {}) {
    const test = { name, status, details, timestamp: new Date().toISOString() };
    results.tests.push(test);
    results.summary.total++;
    if (status === 'passed') {
      results.summary.passed++;
    } else {
      results.summary.failed++;
    }
    console.log(`${status === 'passed' ? '✅' : '❌'} ${name}`);
    if (details.error) {
      console.log(`   错误: ${details.error}`);
    }
  }

  // 1. 检查AI助手页面文件存在
  const aiPagePath = '/home/devbox/project/client/src/pages/ai/AIAssistantPage.vue';
  if (fs.existsSync(aiPagePath)) {
    addTest('AI助手页面文件存在', 'passed', { path: aiPagePath });
  } else {
    addTest('AI助手页面文件存在', 'failed', { error: '文件不存在', path: aiPagePath });
    return results;
  }

  // 2. 读取页面内容
  let pageContent;
  try {
    pageContent = fs.readFileSync(aiPagePath, 'utf-8');
    addTest('页面内容读取', 'passed', { size: pageContent.length });
  } catch (error) {
    addTest('页面内容读取', 'failed', { error: error.message });
    return results;
  }

  // 3. 验证核心组件结构
  const coreComponents = [
    { pattern: /ai-assistant-workbench/, name: '工作台容器' },
    { pattern: /workbench-header/, name: '顶部工具栏' },
    { pattern: /tools-sidebar/, name: '左侧工具面板' },
    { pattern: /conversation-area/, name: '中央对话区' },
    { pattern: /info-panel/, name: '右侧信息面板' },
    { pattern: /input-area/, name: '输入区域' }
  ];

  coreComponents.forEach(({ pattern, name }) => {
    if (pattern.test(pageContent)) {
      addTest(`核心组件: ${name}`, 'passed');
    } else {
      addTest(`核心组件: ${name}`, 'failed', { error: '组件未找到' });
    }
  });

  // 4. 验证AI工具集分类
  const toolCategories = [
    { pattern: /智能对话/, name: '智能对话分类' },
    { pattern: /智能分析/, name: '智能分析分类' },
    { pattern: /内容创作/, name: '内容创作分类' },
    { pattern: /智能管理/, name: '智能管理分类' }
  ];

  toolCategories.forEach(({ pattern, name }) => {
    if (pattern.test(pageContent)) {
      addTest(`工具分类: ${name}`, 'passed');
    } else {
      addTest(`工具分类: ${name}`, 'failed', { error: '分类未找到' });
    }
  });

  // 5. 验证具体AI工具
  const aiTools = [
    { pattern: /general-chat/, name: '通用对话工具' },
    { pattern: /expert-consultation/, name: '专家咨询工具' },
    { pattern: /student-analysis/, name: '学生分析工具' },
    { pattern: /teacher-analysis/, name: '教师效能工具' },
    { pattern: /activity-planner/, name: '活动策划工具' },
    { pattern: /schedule-optimizer/, name: '排课优化工具' }
  ];

  aiTools.forEach(({ pattern, name }) => {
    if (pattern.test(pageContent)) {
      addTest(`AI工具: ${name}`, 'passed');
    } else {
      addTest(`AI工具: ${name}`, 'failed', { error: '工具未找到' });
    }
  });

  // 6. 验证API集成
  const apiIntegrations = [
    { pattern: /useUserStore/, name: '用户状态管理' },
    { pattern: /aiApi/, name: 'AI API集成' },
    { pattern: /getDefaultAIModel/, name: 'AI模型配置' },
    { pattern: /createMemoryWithEmbedding/, name: '记忆管理API' },
    { pattern: /findSimilarMemories/, name: '记忆搜索API' }
  ];

  apiIntegrations.forEach(({ pattern, name }) => {
    if (pattern.test(pageContent)) {
      addTest(`API集成: ${name}`, 'passed');
    } else {
      addTest(`API集成: ${name}`, 'failed', { error: 'API集成未找到' });
    }
  });

  // 7. 验证核心功能方法
  const coreMethods = [
    { pattern: /sendMessage/, name: '发送消息方法' },
    { pattern: /selectTool/, name: '工具选择方法' },
    { pattern: /handleModelChange/, name: '模型切换方法' },
    { pattern: /saveToMemory/, name: '保存记忆方法' },
    { pattern: /searchMemories/, name: '搜索记忆方法' },
    { pattern: /copyMessage/, name: '复制消息方法' },
    { pattern: /regenerateMessage/, name: '重新生成方法' }
  ];

  coreMethods.forEach(({ pattern, name }) => {
    if (pattern.test(pageContent)) {
      addTest(`核心方法: ${name}`, 'passed');
    } else {
      addTest(`核心方法: ${name}`, 'failed', { error: '方法未找到' });
    }
  });

  // 8. 验证UI交互功能
  const uiFeatures = [
    { pattern: /toggleLayout/, name: '布局切换' },
    { pattern: /newConversation/, name: '新建对话' },
    { pattern: /clearConversation/, name: '清空对话' },
    { pattern: /openSettings/, name: '设置功能' },
    { pattern: /showHelp/, name: '帮助功能' },
    { pattern: /attachFile/, name: '文件上传' },
    { pattern: /toggleVoiceInput/, name: '语音输入' }
  ];

  uiFeatures.forEach(({ pattern, name }) => {
    if (pattern.test(pageContent)) {
      addTest(`UI功能: ${name}`, 'passed');
    } else {
      addTest(`UI功能: ${name}`, 'failed', { error: 'UI功能未找到' });
    }
  });

  // 9. 验证样式系统
  const styleFeatures = [
    { pattern: /workbench-header/, name: '头部样式' },
    { pattern: /slide-down-enter-active/, name: '动画效果' },
    { pattern: /typing.*animation/, name: '打字动画' },
    { pattern: /@media.*max-width/, name: '响应式布局' },
    { pattern: /\.tools-sidebar/, name: '工具栏样式' }
  ];

  styleFeatures.forEach(({ pattern, name }) => {
    if (pattern.test(pageContent)) {
      addTest(`样式功能: ${name}`, 'passed');
    } else {
      addTest(`样式功能: ${name}`, 'failed', { error: '样式未找到' });
    }
  });

  // 10. 验证Element Plus集成
  const elementComponents = [
    { pattern: /el-button/, name: 'Button组件' },
    { pattern: /el-input/, name: 'Input组件' },
    { pattern: /el-tabs/, name: 'Tabs组件' },
    { pattern: /el-dialog/, name: 'Dialog组件' },
    { pattern: /el-dropdown/, name: 'Dropdown组件' },
    { pattern: /el-tag/, name: 'Tag组件' },
    { pattern: /el-avatar/, name: 'Avatar组件' }
  ];

  elementComponents.forEach(({ pattern, name }) => {
    if (pattern.test(pageContent)) {
      addTest(`Element Plus: ${name}`, 'passed');
    } else {
      addTest(`Element Plus: ${name}`, 'failed', { error: '组件未找到' });
    }
  });

  // 生成测试报告
  console.log('\n' + '='.repeat(60));
  console.log('🧪 AI助手页面验证报告');
  console.log('='.repeat(60));
  console.log(`📊 总测试数: ${results.summary.total}`);
  console.log(`✅ 通过测试: ${results.summary.passed}`);
  console.log(`❌ 失败测试: ${results.summary.failed}`);
  console.log(`📈 成功率: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

  if (results.summary.failed > 0) {
    console.log('\n❌ 失败的测试:');
    results.tests
      .filter(t => t.status === 'failed')
      .slice(0, 10) // 只显示前10个失败项
      .forEach((test, i) => {
        console.log(`  ${i + 1}. ${test.name}`);
        if (test.details.error) {
          console.log(`     错误: ${test.details.error}`);
        }
      });
    
    if (results.summary.failed > 10) {
      console.log(`  ... 和其他 ${results.summary.failed - 10} 个失败测试`);
    }
  }

  console.log('='.repeat(60));

  // 保存详细报告
  const reportPath = path.join(__dirname, `ai-page-verification-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📋 详细报告已保存: ${reportPath}`);

  return results;
}

// 运行验证
if (import.meta.url === `file://${process.argv[1]}`) {
  const results = verifyAIPage();
  const success = results.summary.failed === 0;
  process.exit(success ? 0 : 1);
}

export { verifyAIPage };