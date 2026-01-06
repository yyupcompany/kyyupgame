/**
 * 100个园长提示词自动化测试脚本
 * 测试AI助手的API调用流程和确认对话框功能
 */

const http = require('http');
const fs = require('fs');

// 测试配置
const CONFIG = {
  backendUrl: 'http://localhost:3000',
  testTimeout: 60000,
  delayBetweenTests: 1000,
  outputFile: './principal-prompts-test-results.json',
  summaryFile: './principal-prompts-test-summary.md'
};

// 加载提示词
const prompts = JSON.parse(fs.readFileSync('./principal-prompts-100.json', 'utf-8'));

// 测试结果
const testResults = {
  timestamp: new Date().toISOString(),
  total: 0,
  passed: 0,
  failed: 0,
  errors: 0,
  categories: {},
  details: []
};

// 发送SSE请求并收集响应
async function sendAIRequest(prompt, timeout = CONFIG.testTimeout) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const events = [];
    let responseText = '';
    let toolCalls = [];
    let needsConfirm = false;
    let confirmData = null;
    
    const postData = JSON.stringify({
      content: prompt,
      userId: 1,
      userRole: 'principal',
      kindergartenId: 1,
      context: {}
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/ai/unified/stream-chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': 'Bearer test-token'
      }
    };

    const req = http.request(options, (res) => {
      let buffer = '';
      
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              events.push(data);
              
              // 收集工具调用
              if (data.type === 'tool_call_start' || data.type === 'tool_call') {
                toolCalls.push(data.toolName || data.tool);
              }
              
              // 检查是否需要确认
              if (data.type === 'confirm_required' || data.needsConfirm) {
                needsConfirm = true;
                confirmData = data;
              }
              
              // 收集回答内容
              if (data.type === 'answer_chunk' || data.type === 'content') {
                responseText += data.content || '';
              }
              
              if (data.type === 'answer_complete' || data.type === 'answer') {
                responseText = data.content || responseText;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      });
      
      res.on('end', () => {
        resolve({
          success: true,
          duration: Date.now() - startTime,
          events,
          toolCalls: [...new Set(toolCalls)],
          responseText: responseText.substring(0, 500),
          needsConfirm,
          confirmData,
          statusCode: res.statusCode
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        events: [],
        toolCalls: [],
        responseText: '',
        needsConfirm: false
      });
    });

    // 超时处理
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve({
        success: false,
        duration: timeout,
        error: 'Request timeout',
        events,
        toolCalls: [...new Set(toolCalls)],
        responseText: responseText.substring(0, 500),
        needsConfirm
      });
    });

    req.write(postData);
    req.end();
  });
}

// 测试单个提示词
async function testPrompt(promptObj, categoryName) {
  console.log(`\n[${promptObj.id}] 测试: "${promptObj.text}"`);
  console.log(`    类型: ${promptObj.type}, 预期确认: ${promptObj.needs_confirm || false}`);
  
  const result = await sendAIRequest(promptObj.text);
  
  // 评估结果
  const evaluation = {
    id: promptObj.id,
    prompt: promptObj.text,
    category: categoryName,
    type: promptObj.type,
    expectedConfirm: promptObj.needs_confirm || false,
    ...result,
    status: 'unknown'
  };
  
  if (!result.success) {
    evaluation.status = 'error';
    console.log(`    ❌ 错误: ${result.error}`);
  } else if (result.toolCalls.length > 0) {
    // 有工具调用
    if (promptObj.needs_confirm && result.needsConfirm) {
      evaluation.status = 'passed';
      console.log(`    ✅ 通过: 正确触发确认对话框`);
    } else if (!promptObj.needs_confirm && !result.needsConfirm) {
      evaluation.status = 'passed';
      console.log(`    ✅ 通过: 查询类操作，无需确认`);
    } else if (promptObj.needs_confirm && !result.needsConfirm) {
      evaluation.status = 'warning';
      console.log(`    ⚠️ 警告: 预期需要确认但未触发`);
    } else {
      evaluation.status = 'passed';
      console.log(`    ✅ 通过: 工具调用成功`);
    }
    console.log(`    工具: ${result.toolCalls.join(', ')}`);
  } else if (result.responseText) {
    evaluation.status = 'passed';
    console.log(`    ✅ 通过: AI直接回答`);
  } else {
    evaluation.status = 'failed';
    console.log(`    ❌ 失败: 无工具调用且无响应`);
  }
  
  console.log(`    耗时: ${result.duration}ms`);
  
  return evaluation;
}

// 运行所有测试
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('🚀 开始100个园长提示词测试');
  console.log(`时间: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
  
  let totalTests = 0;
  
  for (const [categoryKey, category] of Object.entries(prompts.categories)) {
    console.log(`\n${'='.repeat(40)}`);
    console.log(`📂 ${category.name} (${category.count}个)`);
    console.log('='.repeat(40));
    
    testResults.categories[categoryKey] = {
      name: category.name,
      total: category.prompts.length,
      passed: 0,
      failed: 0,
      errors: 0,
      warnings: 0
    };
    
    for (const promptObj of category.prompts) {
      totalTests++;
      const result = await testPrompt(promptObj, category.name);
      testResults.details.push(result);
      
      // 统计
      if (result.status === 'passed') {
        testResults.passed++;
        testResults.categories[categoryKey].passed++;
      } else if (result.status === 'failed') {
        testResults.failed++;
        testResults.categories[categoryKey].failed++;
      } else if (result.status === 'warning') {
        testResults.categories[categoryKey].warnings++;
        testResults.passed++; // 警告也算通过
      } else {
        testResults.errors++;
        testResults.categories[categoryKey].errors++;
      }
      
      // 延迟防止请求过快
      await new Promise(r => setTimeout(r, CONFIG.delayBetweenTests));
    }
  }
  
  testResults.total = totalTests;
  
  // 保存结果
  fs.writeFileSync(CONFIG.outputFile, JSON.stringify(testResults, null, 2));
  
  // 生成摘要报告
  generateSummary();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试完成!');
  console.log('='.repeat(60));
  console.log(`总计: ${testResults.total}`);
  console.log(`通过: ${testResults.passed} (${(testResults.passed/testResults.total*100).toFixed(1)}%)`);
  console.log(`失败: ${testResults.failed}`);
  console.log(`错误: ${testResults.errors}`);
  console.log(`\n结果已保存到: ${CONFIG.outputFile}`);
  console.log(`摘要报告: ${CONFIG.summaryFile}`);
}

// 生成Markdown摘要
function generateSummary() {
  let md = `# 园长提示词测试报告\n\n`;
  md += `**测试时间**: ${new Date().toLocaleString()}\n\n`;
  md += `## 📊 总体统计\n\n`;
  md += `| 指标 | 数值 |\n|------|------|\n`;
  md += `| 总测试数 | ${testResults.total} |\n`;
  md += `| 通过 | ${testResults.passed} (${(testResults.passed/testResults.total*100).toFixed(1)}%) |\n`;
  md += `| 失败 | ${testResults.failed} |\n`;
  md += `| 错误 | ${testResults.errors} |\n\n`;
  
  md += `## 📂 分类统计\n\n`;
  md += `| 分类 | 总数 | 通过 | 失败 | 错误 | 警告 |\n`;
  md += `|------|------|------|------|------|------|\n`;
  
  for (const [key, cat] of Object.entries(testResults.categories)) {
    md += `| ${cat.name} | ${cat.total} | ${cat.passed} | ${cat.failed} | ${cat.errors} | ${cat.warnings || 0} |\n`;
  }
  
  md += `\n## 🔍 详细结果\n\n`;
  
  // 按类型分组
  const byType = { READ: [], CREATE: [], UPDATE: [], DELETE: [] };
  testResults.details.forEach(d => {
    if (byType[d.type]) byType[d.type].push(d);
  });
  
  for (const [type, items] of Object.entries(byType)) {
    if (items.length === 0) continue;
    md += `### ${type} 操作 (${items.length}个)\n\n`;
    
    const passed = items.filter(i => i.status === 'passed').length;
    const failed = items.filter(i => i.status === 'failed').length;
    md += `通过率: ${(passed/items.length*100).toFixed(1)}%\n\n`;
    
    // 只列出失败的
    const failedItems = items.filter(i => i.status !== 'passed');
    if (failedItems.length > 0) {
      md += `**失败/错误的测试**:\n`;
      failedItems.forEach(i => {
        md += `- [${i.id}] ${i.prompt} - ${i.status}: ${i.error || '无响应'}\n`;
      });
      md += `\n`;
    }
  }
  
  fs.writeFileSync(CONFIG.summaryFile, md);
}

// 快速测试模式（只测试每个分类的前2个）
async function runQuickTest() {
  console.log('='.repeat(60));
  console.log('🚀 快速测试模式 (每分类2个)');
  console.log('='.repeat(60));
  
  let totalTests = 0;
  
  for (const [categoryKey, category] of Object.entries(prompts.categories)) {
    console.log(`\n📂 ${category.name}`);
    
    // 只测试前2个
    const testPrompts = category.prompts.slice(0, 2);
    
    for (const promptObj of testPrompts) {
      totalTests++;
      await testPrompt(promptObj, category.name);
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  console.log(`\n✅ 快速测试完成，共测试 ${totalTests} 个提示词`);
}

// 主程序
const args = process.argv.slice(2);

if (args.includes('--quick')) {
  runQuickTest().catch(console.error);
} else if (args.includes('--single')) {
  const id = parseInt(args[args.indexOf('--single') + 1]);
  if (id) {
    // 查找指定ID的提示词
    for (const category of Object.values(prompts.categories)) {
      const prompt = category.prompts.find(p => p.id === id);
      if (prompt) {
        testPrompt(prompt, category.name).then(() => process.exit(0));
        break;
      }
    }
  }
} else {
  runAllTests().catch(console.error);
}
