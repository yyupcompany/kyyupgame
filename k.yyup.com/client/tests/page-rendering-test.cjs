const { chromium } = require('playwright');

async function checkPageRendering() {
  console.log('🔍 开始页面渲染验证...');

  const browser = await chromium.launch({
    headless: true,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 监听控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // 监听页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });

  try {
    // 测试登录页面
    console.log('\n📱 测试登录页面...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });

    const loginResult = await page.evaluate(() => {
      const issues = [];
      const warnings = [];
      const successes = [];

      // 1. 检查页面标题
      const title = document.title;
      if (!title) {
        issues.push('页面标题缺失');
      }

      // 2. 检查重复ID
      const allElements = document.querySelectorAll('*[id]');
      const idMap = new Map();
      let duplicateIdCount = 0;

      allElements.forEach(element => {
        const id = element.id;
        if (idMap.has(id)) {
          idMap.get(id).push(element);
          duplicateIdCount++;
        } else {
          idMap.set(id, [element]);
        }
      });

      // 报告重复ID
      for (const [id, elements] of idMap.entries()) {
        if (elements.length > 1) {
          issues.push(`重复ID: ${id} (${elements.length}个元素)`);
        }
      }

      // 3. 检查登录表单组件
      const loginForms = document.querySelectorAll('form');
      const loginContainers = document.querySelectorAll('[class*="login"], [id*="login"]');

      if (loginForms.length > 1) {
        issues.push(`发现多个登录表单: ${loginForms.length}个`);
      } else if (loginForms.length === 1) {
        successes.push('登录表单组件正常');
      }

      if (loginContainers.length > 3) {
        warnings.push(`登录相关容器过多: ${loginContainers.length}个`);
      }

      // 4. DOM统计
      const bodyElement = document.body;
      const totalNodes = bodyElement ? bodyElement.getElementsByTagName('*').length : 0;
      const interactiveElements = bodyElement ?
        bodyElement.querySelectorAll('button, input, select, textarea, a, [onclick], [role="button"]').length : 0;

      return {
        page: 'login',
        title: title,
        summary: {
          totalElements: allElements.length,
          duplicateIds: duplicateIdCount,
          loginForms: loginForms.length,
          loginContainers: loginContainers.length,
          totalNodes: totalNodes,
          interactiveElements: interactiveElements
        },
        issues,
        warnings,
        successes
      };
    });

    console.log(`✅ 登录页面分析完成`);
    console.log(`   - 页面标题: ${loginResult.title}`);
    console.log(`   - 总元素数量: ${loginResult.summary.totalElements}`);
    console.log(`   - 重复ID数量: ${loginResult.summary.duplicateIds}`);
    console.log(`   - 登录表单数量: ${loginResult.summary.loginForms}`);
    console.log(`   - 问题: ${loginResult.issues.length}个`);
    console.log(`   - 警告: ${loginResult.warnings.length}个`);

    // 测试AI助手页面
    console.log('\n🤖 测试AI助手页面...');
    await page.goto('http://localhost:5173/ai/assistant', { waitUntil: 'networkidle' });

    const aiResult = await page.evaluate(() => {
      const issues = [];
      const warnings = [];
      const successes = [];

      // 1. 检查AI助手容器
      const aiContainers = document.querySelectorAll('[class*="ai-assistant"], [id*="ai-assistant"]');
      const messageLists = document.querySelectorAll('[class*="message-list"], [class*="MessageList"]');
      const inputAreas = document.querySelectorAll('[class*="input"], [class*="Input"]');
      const conversationTabs = document.querySelectorAll('[class*="conversation"], [class*="Conversation"]');

      if (aiContainers.length > 2) {
        issues.push(`AI助手容器过多: ${aiContainers.length}个`);
      } else if (aiContainers.length === 1) {
        successes.push('AI助手主容器正常');
      }

      if (messageLists.length > 2) {
        issues.push(`消息列表重复: ${messageLists.length}个`);
      } else if (messageLists.length === 1) {
        successes.push('消息列表组件正常');
      }

      if (inputAreas.length > 2) {
        warnings.push(`输入区域过多: ${inputAreas.length}个`);
      }

      if (conversationTabs.length > 1) {
        successes.push('会话标签页功能正常');
      } else {
        warnings.push('会话标签页可能未正确渲染');
      }

      // 2. 检查重复ID
      const allElements = document.querySelectorAll('*[id]');
      const idMap = new Map();
      let duplicateIdCount = 0;

      allElements.forEach(element => {
        const id = element.id;
        if (idMap.has(id)) {
          idMap.get(id).push(element);
          duplicateIdCount++;
        } else {
          idMap.set(id, [element]);
        }
      });

      for (const [id, elements] of idMap.entries()) {
        if (elements.length > 1) {
          issues.push(`重复ID: ${id} (${elements.length}个元素)`);
        }
      }

      // 3. DOM统计
      const bodyElement = document.body;
      const totalNodes = bodyElement ? bodyElement.getElementsByTagName('*').length : 0;
      const interactiveElements = bodyElement ?
        bodyElement.querySelectorAll('button, input, select, textarea, a, [onclick], [role="button"]').length : 0;

      return {
        page: 'ai-assistant',
        summary: {
          totalElements: allElements.length,
          duplicateIds: duplicateIdCount,
          aiContainers: aiContainers.length,
          messageLists: messageLists.length,
          inputAreas: inputAreas.length,
          conversationTabs: conversationTabs.length,
          totalNodes: totalNodes,
          interactiveElements: interactiveElements
        },
        issues,
        warnings,
        successes
      };
    });

    console.log(`✅ AI助手页面分析完成`);
    console.log(`   - 总元素数量: ${aiResult.summary.totalElements}`);
    console.log(`   - 重复ID数量: ${aiResult.summary.duplicateIds}`);
    console.log(`   - AI助手容器: ${aiResult.summary.aiContainers}`);
    console.log(`   - 消息列表: ${aiResult.summary.messageLists}`);
    console.log(`   - 会话标签页: ${aiResult.summary.conversationTabs}`);
    console.log(`   - 问题: ${aiResult.issues.length}个`);
    console.log(`   - 警告: ${aiResult.warnings.length}个`);

    // 生成综合报告
    console.log('\n📊 页面渲染验证综合报告');
    console.log('='.repeat(60));

    const totalIssues = loginResult.issues.length + aiResult.issues.length;
    const totalWarnings = loginResult.warnings.length + aiResult.warnings.length;
    const totalSuccesses = loginResult.successes.length + aiResult.successes.length;

    console.log(`\n📈 统计汇总:`);
    console.log(`  总问题数: ${totalIssues}`);
    console.log(`  总警告数: ${totalWarnings}`);
    console.log(`  成功项数: ${totalSuccesses}`);

    if (totalIssues > 0) {
      console.log(`\n❌ 发现的问题:`);
      [...loginResult.issues, ...aiResult.issues].forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    if (totalWarnings > 0) {
      console.log(`\n⚠️ 警告信息:`);
      [...loginResult.warnings, ...aiResult.warnings].forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    if (totalSuccesses > 0) {
      console.log(`\n✅ 正常项:`);
      [...loginResult.successes, ...aiResult.successes].forEach((success, index) => {
        console.log(`  ${index + 1}. ${success}`);
      });
    }

    if (consoleErrors.length > 0) {
      console.log(`\n🔥 控制台错误:`);
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (pageErrors.length > 0) {
      console.log(`\n💥 页面错误:`);
      pageErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // 总体评估
    let status = '🟢 优秀';
    let message = '页面渲染状态良好，未发现重复组件或事件错位问题';

    if (totalIssues > 0 || totalWarnings > 3) {
      status = '🔴 需要修复';
      message = '发现重复组件显示或事件错位问题，需要修复';
    } else if (totalWarnings > 0) {
      status = '🟡 良好';
      message = '页面渲染基本正常，存在轻微问题';
    }

    console.log(`\n🎯 总体评估: ${status}`);
    console.log(`   ${message}`);

    // 保存详细报告
    const report = {
      timestamp: new Date().toISOString(),
      login: loginResult,
      aiAssistant: aiResult,
      consoleErrors,
      pageErrors,
      summary: {
        totalIssues,
        totalWarnings,
        totalSuccesses,
        status,
        message
      }
    };

    const fs = require('fs');
    fs.writeFileSync('test-results/page-rendering-report.json', JSON.stringify(report, null, 2));
    console.log(`\n📄 详细报告已保存到: test-results/page-rendering-report.json`);

  } catch (error) {
    console.error('❌ 测试执行失败:', error.message);
  } finally {
    await browser.close();
  }
}

// 确保测试结果目录存在
const fs = require('fs');
if (!fs.existsSync('test-results')) {
  fs.mkdirSync('test-results');
}

// 运行测试
checkPageRendering().catch(console.error);