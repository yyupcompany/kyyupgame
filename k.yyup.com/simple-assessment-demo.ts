/**
 * 简化版测评演示 - 直接使用快速登录按钮
 */
import { browserManager, pageOperations, screenshotService } from './playwright-api-service/dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './assessment-demo-screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function completeSimpleAssessment() {
  console.log('='.repeat(80));
  console.log('🎯 简化版测评演示 - 使用快速登录');
  console.log('='.repeat(80));

  const startTime = Date.now();

  try {
    // 1. 启动浏览器 (无头模式)
    console.log('\n1️⃣ 启动浏览器...');
    await browserManager.launch({
      headless: true,  // 使用无头模式
      viewport: { width: 1920, height: 1080 }
    });
    console.log('✅ 浏览器启动成功');

    // 2. 访问登录页面
    console.log('\n2️⃣ 访问登录页面...');
    await pageOperations.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await pageOperations.wait(2000);

    // 3. 截图登录页面
    const loginScreenshot = path.join(SCREENSHOT_DIR, '01-login-page.png');
    await screenshotService.saveScreenshot('01-login-page.png', SCREENSHOT_DIR);
    console.log('✅ 已保存登录页面截图');

    const page = browserManager.getPage();

    // 4. 尝试快速登录按钮
    console.log('\n3️⃣ 尝试快速登录按钮...');

    const quickButtons = [
      { selector: '.quick-btn.parent-btn', name: '家长' },
      { selector: '.quick-btn.teacher-btn', name: '教师' },
      { selector: '.quick-btn.admin-btn', name: '系统管理员' },
      { selector: '.quick-btn.principal-btn', name: '园长' }
    ];

    let loginSuccess = false;
    let loggedInAs = '';

    for (const btn of quickButtons) {
      try {
        console.log(`🔄 尝试点击 ${btn.name} 快速登录...`);

        // 先截图登录页面
        await screenshotService.saveScreenshot(`login-${btn.name}.png`, SCREENSHOT_DIR);

        const button = await page.waitForSelector(btn.selector, { timeout: 3000 });
        if (button) {
          console.log(`✅ 找到 ${btn.name} 按钮，正在点击...`);
          await button.click();

          // 等待页面响应
          console.log('⏳ 等待页面跳转...');
          await pageOperations.wait(5000);

          const currentUrl = await pageOperations.getURL();
          console.log(`🔍 当前URL: ${currentUrl}`);

          // 检查是否成功跳转（不在登录页面）
          if (!currentUrl.includes('/login')) {
            loginSuccess = true;
            loggedInAs = btn.name;
            console.log(`✅ 使用 ${btn.name} 快速登录成功！`);
            break;
          } else {
            console.log(`⚠️  ${btn.name} 登录后仍停留在登录页面，可能需要额外时间`);
            await pageOperations.wait(3000);

            // 再次检查
            const newUrl = await pageOperations.getURL();
            if (!newUrl.includes('/login')) {
              loginSuccess = true;
              loggedInAs = btn.name;
              console.log(`✅ 延迟确认：${btn.name} 登录成功！`);
              break;
            }
          }
        }
      } catch (e) {
        console.log(`❌ ${btn.name} 快速登录失败: ${e.message}`);
      }

      // 如果没成功，尝试下一个
      if (!loginSuccess) {
        console.log(`🔄 尝试下一个登录方式...`);
        await pageOperations.wait(2000);
      }
    }

    if (!loginSuccess) {
      console.log('❌ 所有快速登录都失败');
      throw new Error('无法登录');
    }

    // 5. 截图登录成功页面
    const dashboardScreenshot = path.join(SCREENSHOT_DIR, '02-dashboard-after-login.png');
    await screenshotService.saveScreenshot('02-dashboard-after-login.png', SCREENSHOT_DIR);
    console.log('✅ 已保存登录后页面截图');

    // 6. 尝试访问测评中心
    console.log('\n4️⃣ 尝试访问测评中心...');
    const assessmentUrls = [
      `${BASE_URL}/parent-center/assessment`,
      `${BASE_URL}/parent-center/assessment/development`,
      `${BASE_URL}/parent-center/assessment/school-readiness`,
      `${BASE_URL}/parent-center/assessment/academic`
    ];

    for (const url of assessmentUrls) {
      try {
        console.log(`🔄 尝试访问: ${url}`);
        await pageOperations.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 20000
        });

        await pageOperations.wait(2000);

        const currentUrl = await pageOperations.getURL();
        console.log(`   当前URL: ${currentUrl}`);

        // 截图
        const urlPath = new URL(url).pathname.replace(/\//g, '-');
        const screenshotPath = path.join(SCREENSHOT_DIR, `03-${urlPath}.png`);
        await screenshotService.saveScreenshot(`03-${urlPath}.png`, SCREENSHOT_DIR);
        console.log(`✅ 已保存页面截图`);

        // 检查是否有开始测评按钮
        try {
          const startButton = await page.waitForSelector('text=/开始/', { timeout: 3000 });
          if (startButton) {
            console.log('✅ 找到开始测评按钮');

            // 点击开始测评
            await startButton.click();
            await pageOperations.wait(3000);

            // 截图测评页面
            const assessmentScreenshot = path.join(SCREENSHOT_DIR, `04-${urlPath}-assessment.png`);
            await screenshotService.saveScreenshot(`04-${urlPath}-assessment.png`, SCREENSHOT_DIR);
            console.log('✅ 已保存测评进行中截图');
          }
        } catch (e) {
          console.log('⚠️  未找到开始测评按钮');
        }

        // 如果成功访问测评页面，跳出循环
        if (currentUrl.includes('/assessment')) {
          console.log('✅ 成功访问测评页面！');
          break;
        }
      } catch (e) {
        console.log(`⚠️  访问失败: ${e.message}`);
      }
    }

    // 7. 生成报告
    const duration = Date.now() - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${minutes}分${seconds}秒`,
      loggedInAs: loggedInAs,
      loginSuccess: loginSuccess,
      screenshots: fs.readdirSync(SCREENSHOT_DIR).map(f => ({
        name: f,
        path: path.join(SCREENSHOT_DIR, f)
      }))
    };

    const reportPath = path.join(SCREENSHOT_DIR, `assessment-demo-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('📋 测评演示报告');
    console.log('='.repeat(80));
    console.log(`登录方式: ${loggedInAs} 快速登录`);
    console.log(`登录状态: ${loginSuccess ? '成功' : '失败'}`);
    console.log(`总耗时: ${report.duration}`);
    console.log(`报告路径: ${reportPath}`);
    console.log(`截图目录: ${SCREENSHOT_DIR}`);
    console.log('='.repeat(80));

    console.log('\n📸 生成的截图:');
    for (const screenshot of report.screenshots) {
      console.log(`  - ${screenshot.name}`);
    }

    console.log('\n✨ 测评演示完成！');
    console.log('\n💡 提示: 浏览器窗口将保持打开，您可以手动操作');
    console.log('    按 Ctrl+C 退出');

    // 保持浏览器打开
    await new Promise(resolve => setTimeout(resolve, 60000)); // 等待60秒

    return 0;

  } catch (error: any) {
    console.error('\n❌ 测评演示失败:', error.message);
    return 1;

  } finally {
    // 8. 关闭浏览器
    console.log('\n🔚 关闭浏览器...');
    await browserManager.close();
    console.log('✅ 浏览器已关闭');
  }
}

// 执行演示
completeSimpleAssessment()
  .then(exitCode => {
    console.log(`\n脚本执行完成，退出码: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('\n脚本执行失败:', error);
    process.exit(1);
  });
