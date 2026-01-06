const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 创建截图目录
const screenshotDir = path.join(__dirname, 'test-screenshots', 'centers-simple-' + new Date().toISOString().replace(/[:.]/g, '-'));
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function simpleCentersTest() {
  console.log('🚀 开始简化的检查中心和文档中心测试');

  let browser;
  try {
    browser = await chromium.launch({
      headless: false,
      slowMo: 500,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    // 监听控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });

      if (type === 'error') {
        console.error(`🚨 控制台错误: ${text}`);
      } else if (text.includes('API') || text.includes('加载')) {
        console.log(`📝 ${type}: ${text}`);
      }
    });

    // 截图函数（简化版）
    const takeScreenshot = async (name) => {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${timestamp}-${name}.png`;
        const filepath = path.join(screenshotDir, filename);

        await page.screenshot({
          path: filepath,
          fullPage: false,
          timeout: 10000
        });
        console.log(`📸 截图: ${filename}`);
        return filepath;
      } catch (error) {
        console.error(`截图失败 ${name}:`, error.message);
        return null;
      }
    };

    console.log('\n=== 步骤1：访问系统 ===');

    await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    await page.waitForTimeout(3000);
    await takeScreenshot('01-首页');

    console.log('\n=== 步骤2：登录系统 ===');

    // 尝试多种登录方式
    try {
      // 方式1：寻找快捷登录按钮
      const quickLoginBtn = page.locator('button:has-text("管理员"), button:has-text("admin"), button.admin-login').first();

      if (await quickLoginBtn.isVisible({ timeout: 3000 })) {
        console.log('🔑 找到快捷登录按钮');
        await quickLoginBtn.click();
      } else {
        // 方式2：手动填写登录表单
        console.log('🔑 手动填写登录表单');

        const usernameInput = page.locator('input[type="text"], input[placeholder*="用户"], input[name="username"]').first();
        const passwordInput = page.locator('input[type="password"], input[placeholder*="密码"], input[name="password"]').first();

        await usernameInput.fill('admin');
        await passwordInput.fill('admin123');

        const submitBtn = page.locator('button[type="submit"], button:has-text("登录"), .el-button--primary').first();
        await submitBtn.click();
      }
    } catch (error) {
      console.error('登录失败:', error.message);
      await takeScreenshot('02-登录失败');
      throw error;
    }

    // 等待登录完成
    await page.waitForTimeout(5000);
    await takeScreenshot('02-登录后');

    // 检查是否登录成功
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      throw new Error('登录失败，仍在登录页面');
    }

    console.log(`✅ 登录成功: ${currentUrl}`);

    console.log('\n=== 步骤3：页面分析 ===');

    // 分析当前页面结构
    const pageAnalysis = await page.evaluate(() => {
      const result = {
        url: window.location.href,
        title: document.title,
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
        forms: document.querySelectorAll('form').length,
        hasVue: !!window.Vue,
        hasElementPlus: !!window.ElementPlus
      };

      // 查找所有包含"中心"的元素
      const centerElements = [];
      document.querySelectorAll('a, button, span, div').forEach(el => {
        const text = el.textContent?.trim();
        if (text && (text.includes('中心') || text.includes('检查') || text.includes('文档'))) {
          centerElements.push({
            text,
            tag: el.tagName,
            class: el.className,
            href: el.href || ''
          });
        }
      });

      result.centerElements = centerElements.slice(0, 10); // 只取前10个
      return result;
    });

    console.log('📊 页面分析:', JSON.stringify(pageAnalysis, null, 2));

    console.log('\n=== 步骤4：寻找检查中心 ===');

    // 尝试多种方式找到检查中心
    const inspectionFound = await findAndTestCenter(page, '检查中心', [
      'a:has-text("检查中心")',
      'button:has-text("检查中心")',
      '.menu-item:has-text("检查中心")',
      'a:has-text("检查")',
      'button:has-text("检查")'
    ], takeScreenshot, 'inspection');

    if (!inspectionFound) {
      console.log('🔍 尝试直接访问检查中心URL');
      await tryDirectUrls(page, [
        'http://localhost:5173/centers/InspectionCenter',
        'http://localhost:5173/inspection-center',
        'http://localhost:5173/#/centers/InspectionCenter'
      ], '检查中心', takeScreenshot);
    }

    console.log('\n=== 步骤5：寻找文档中心 ===');

    // 返回主页
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const documentFound = await findAndTestCenter(page, '文档中心', [
      'a:has-text("文档中心")',
      'button:has-text("文档中心")',
      '.menu-item:has-text("文档中心")',
      'a:has-text("文档")',
      'button:has-text("文档")',
      'a:has-text("协作")',
      'button:has-text("协作")'
    ], takeScreenshot, 'document');

    if (!documentFound) {
      console.log('🔍 尝试直接访问文档中心URL');
      await tryDirectUrls(page, [
        'http://localhost:5173/centers/DocumentCollaboration',
        'http://localhost:5173/document-center',
        'http://localhost:5173/centers/DocumentTemplateCenter',
        'http://localhost:5173/#/centers/DocumentCollaboration'
      ], '文档中心', takeScreenshot);
    }

    console.log('\n=== 步骤6：最终检查 ===');

    // 最终状态检查
    const finalStatus = await page.evaluate(() => {
      return {
        url: window.location.href,
        hasErrors: document.querySelectorAll('.error, .el-message--error').length,
        vueMounted: !!document.querySelector('#app').__vue__,
        pageTitle: document.title
      };
    });

    console.log('📊 最终状态:', finalStatus);
    await takeScreenshot('06-最终状态');

    // 生成测试报告
    generateTestReport(screenshotDir, consoleMessages, pageAnalysis, finalStatus);

    console.log('\n⏳ 测试完成，5秒后关闭...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('✅ 简化测试完成！');
  }
}

// 辅助函数：查找并测试中心功能
async function findAndTestCenter(page, centerName, selectors, takeScreenshot, prefix) {
  for (const selector of selectors) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`✅ 找到${centerName}: ${selector}`);
        await element.click();
        await page.waitForTimeout(3000);
        await takeScreenshot(`${prefix}-${centerName}-主页`);

        // 测试功能模块
        await testCenterFeatures(page, centerName, takeScreenshot, prefix);
        return true;
      }
    } catch (error) {
      // 继续尝试下一个选择器
    }
  }
  console.log(`❌ 未找到${centerName}入口`);
  return false;
}

// 辅助函数：尝试直接访问URL
async function tryDirectUrls(page, urls, centerName, takeScreenshot) {
  for (const url of urls) {
    try {
      console.log(`🔗 尝试访问: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(3000);
      await takeScreenshot(`direct-${centerName}`);
      console.log(`✅ 成功访问${centerName}: ${url}`);
      return true;
    } catch (error) {
      console.log(`❌ 访问失败: ${url}`);
    }
  }
  return false;
}

// 辅助函数：测试中心功能
async function testCenterFeatures(page, centerName, takeScreenshot, prefix) {
  const features = [
    { name: '新增', selector: 'button:has-text("新增"), button:has-text("创建"), button:has-text("添加")' },
    { name: '编辑', selector: 'button:has-text("编辑"), button:has-text("修改")' },
    { name: '删除', selector: 'button:has-text("删除"), button:has-text("移除")' },
    { name: '查询', selector: 'button:has-text("查询"), button:has-text("搜索")' },
    { name: '列表', selector: 'table, .el-table' }
  ];

  for (const feature of features) {
    try {
      const elements = page.locator(feature.selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`  ✅ ${centerName} - ${feature.name}: ${count}个元素`);

        if (feature.name !== '列表') {
          // 对于按钮，尝试点击第一个
          const firstElement = elements.first();
          if (await firstElement.isVisible()) {
            await firstElement.click();
            await page.waitForTimeout(2000);
            await takeScreenshot(`${prefix}-${centerName}-${feature.name}`);
            // 尝试返回或关闭弹窗
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
          }
        } else {
          // 对于表格，直接截图
          await takeScreenshot(`${prefix}-${centerName}-${feature.name}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ${centerName} - ${feature.name} 测试失败: ${error.message}`);
    }
  }
}

// 辅助函数：生成测试报告
function generateTestReport(screenshotDir, consoleMessages, pageAnalysis, finalStatus) {
  const report = {
    testTime: new Date().toISOString(),
    screenshotDir,
    consoleMessages: consoleMessages.filter(msg => msg.type === 'error').slice(0, 10),
    pageAnalysis,
    finalStatus,
    summary: {
      errors: consoleMessages.filter(msg => msg.type === 'error').length,
      screenshots: fs.readdirSync(screenshotDir).length,
      success: finalStatus.hasErrors === 0
    }
  };

  const reportPath = path.join(screenshotDir, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 测试报告已生成: ${reportPath}`);
}

simpleCentersTest().catch(console.error);