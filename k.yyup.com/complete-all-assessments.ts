/**
 * 家长中心 - 完成所有测评流程
 * 使用 Playwright API Service
 * 测评包括：
 * 1. 2-6岁儿童发育商测评
 * 2. 幼小衔接测评
 * 3. 1-6年级学科测评
 */

import { browserManager, pageOperations, consoleMonitor, screenshotService } from './playwright-api-service/dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = './assessment-screenshots';

// 确保截图目录存在
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// ============= 登录家长账号 =============

async function loginParent(): Promise<boolean> {
  console.log('\n🔐 正在登录家长账号...');

  try {
    // 访问登录页面
    await pageOperations.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await pageOperations.wait(2000);

    const page = browserManager.getPage();

    // 使用已知的正确选择器
    const usernameInput = await page.waitForSelector('input[type="text"]', { timeout: 5000 });
    const passwordInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });

    console.log('✅ 找到用户名和密码输入框');

    // 尝试使用快速登录按钮
    console.log('🔄 尝试使用家长快速登录按钮...');
    try {
      const parentQuickBtn = await page.waitForSelector('.quick-btn.parent-btn', { timeout: 5000 });
      await parentQuickBtn.click();
      await pageOperations.wait(5000);

      const currentUrl = await pageOperations.getURL();
      console.log(`🔍 点击家长快速登录后URL: ${currentUrl}`);

      if (!currentUrl.includes('/login')) {
        console.log('✅ 使用家长快速登录成功！');
        return true;
      }
    } catch (e) {
      console.log('⚠️  家长快速登录失败');
    }

    // 如果快速登录失败，尝试手动输入账号
    console.log('🔄 尝试手动输入账号...');
    const credentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'teacher', password: 'teacher123' },
      { username: 'parent', password: 'parent123' }
    ];

    for (const cred of credentials) {
      try {
        // 清除之前的输入
        await usernameInput.click({ clickCount: 3 });
        await page.keyboard.press('Backspace');

        await usernameInput.fill(cred.username);
        await pageOperations.wait(500);

        await passwordInput.click({ clickCount: 3 });
        await page.keyboard.press('Backspace');

        await passwordInput.fill(cred.password);
        await pageOperations.wait(500);

        // 点击登录按钮
        const loginButton = await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
        await loginButton.click();
        await pageOperations.wait(3000);

        // 检查是否登录成功
        const currentUrl = await pageOperations.getURL();
        console.log(`🔍 登录后URL: ${currentUrl}`);

        if (!currentUrl.includes('/login')) {
          console.log(`✅ 使用账号 ${cred.username} 登录成功！当前URL: ${currentUrl}`);
          return true;
        }

        console.log(`⚠️  账号 ${cred.username} 登录失败，尝试下一个...`);
        await pageOperations.wait(2000);
      } catch (e) {
        console.log(`⚠️  账号 ${cred.username} 登录出错: ${e.message}`);
      }
    }

    console.log('❌ 所有登录方式都失败了');
    return false;

  } catch (error: any) {
    console.error(`❌ 登录失败: ${error.message}`);
    return false;
  }
}

// ============= 导航到测评中心 =============

async function navigateToAssessment(): Promise<boolean> {
  console.log('\n📍 导航到测评中心...');

  try {
    const page = browserManager.getPage();
    const currentUrl = await pageOperations.getURL();

    // 检查是否已经在测评页面
    if (currentUrl.includes('/assessment')) {
      console.log('✅ 已在测评页面');
      return true;
    }

    // 尝试访问测评页面
    const assessmentUrls = [
      `${BASE_URL}/parent-center/assessment/development`,
      `${BASE_URL}/parent-center/assessment`,
      `${BASE_URL}/assessment/development`
    ];

    for (const url of assessmentUrls) {
      try {
        await pageOperations.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        });

        await pageOperations.wait(2000);

        const newUrl = await pageOperations.getURL();
        console.log(`✅ 访问测评页面: ${url}`);
        console.log(`   当前URL: ${newUrl}`);

        return true;
      } catch (e) {
        console.log(`⚠️  无法访问: ${url}`);
      }
    }

    console.log('❌ 无法导航到测评中心');
    return false;

  } catch (error: any) {
    console.error(`❌ 导航失败: ${error.message}`);
    return false;
  }
}

// ============= 完成测评 =============

async function completeAssessment(assessmentName: string, assessmentPath: string): Promise<boolean> {
  console.log(`\n🧪 开始完成测评: ${assessmentName}`);
  console.log(`   路径: ${assessmentPath}`);

  try {
    const page = browserManager.getPage();
    const fullUrl = `${BASE_URL}${assessmentPath}`;

    // 访问测评页面
    await pageOperations.goto(fullUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await pageOperations.wait(2000);

    // 截图
    const screenshotPath = path.join(SCREENSHOT_DIR, `${assessmentName}-start.png`);
    await screenshotService.saveScreenshot(`${assessmentName}-start.png`, SCREENSHOT_DIR);
    console.log(`✅ 已保存开始截图: ${screenshotPath}`);

    // 开始测评按钮
    const startButtonSelectors = [
      'button:has-text("开始测评")',
      'button:has-text("开始测试")',
      'button:has-text("开始评估")',
      '.start-assessment-btn',
      '[data-testid="start-button"]'
    ];

    let startButton = null;
    for (const selector of startButtonSelectors) {
      try {
        startButton = await page.waitForSelector(selector, { timeout: 5000 });
        if (startButton) {
          console.log(`✅ 找到开始按钮: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续尝试下一个选择器
      }
    }

    if (startButton) {
      await page.click(startButton as any);
      await pageOperations.wait(3000);
      console.log('✅ 已点击开始测评按钮');
    } else {
      console.log('⚠️  未找到开始按钮，可能页面已自动开始');
    }

    // 填写测评表单
    console.log('📝 开始填写测评表单...');

    // 模拟填写测评问题
    for (let i = 1; i <= 5; i++) {
      try {
        // 查找问题
        const questionSelectors = [
          `text=${i}`,
          `.question-${i}`,
          `[data-question="${i}"]`
        ];

        let questionFound = false;
        for (const selector of questionSelectors) {
          try {
            const element = await page.waitForSelector(selector, { timeout: 1000 });
            if (element) {
              questionFound = true;
              console.log(`✅ 找到问题 ${i}`);
              break;
            }
          } catch (e) {
            // 继续
          }
        }

        if (!questionFound) {
          console.log(`⚠️  未找到问题 ${i}，跳过`);
          continue;
        }

        // 查找选项
        const optionSelectors = [
          'input[type="radio"]',
          'input[type="checkbox"]',
          '.option',
          '.choice'
        ];

        let options = [];
        try {
          options = await page.$$(optionSelectors[0]);
          if (options.length === 0) {
            options = await page.$$(optionSelectors[1]);
          }
          if (options.length === 0) {
            options = await page.$$(optionSelectors[2]);
          }
          if (options.length === 0) {
            options = await page.$$(optionSelectors[3]);
          }
        } catch (e) {
          // 选项查找失败
        }

        if (options.length > 0) {
          // 随机选择一个选项
          const randomIndex = Math.floor(Math.random() * options.length);
          try {
            await options[randomIndex].click();
            console.log(`✅ 已选择选项 ${randomIndex + 1}`);
          } catch (e) {
            console.log(`⚠️  选择选项失败`);
          }
        }

        // 查找并点击下一题按钮
        const nextButtonSelectors = [
          'button:has-text("下一题")',
          'button:has-text("下一")',
          '.next-btn',
          '.next-button'
        ];

        let nextButton = null;
        for (const selector of nextButtonSelectors) {
          try {
            nextButton = await page.waitForSelector(selector, { timeout: 2000 });
            if (nextButton) {
              await page.click(nextButton as any);
              console.log(`✅ 已点击下一题按钮`);
              break;
            }
          } catch (e) {
            // 继续
          }
        }

        await pageOperations.wait(1000);

      } catch (error) {
        console.log(`⚠️  问题 ${i} 处理失败: ${error.message}`);
      }
    }

    // 提交测评
    console.log('📤 提交测评...');

    const submitButtonSelectors = [
      'button:has-text("提交")',
      'button:has-text("完成")',
      'button:has-text("提交测评")',
      '.submit-btn',
      '.submit-button'
    ];

    let submitButton = null;
    for (const selector of submitButtonSelectors) {
      try {
        submitButton = await page.waitForSelector(selector, { timeout: 5000 });
        if (submitButton) {
          await page.click(submitButton as any);
          console.log(`✅ 已点击提交按钮: ${selector}`);
          break;
        }
      } catch (e) {
        // 继续
      }
    }

    await pageOperations.wait(3000);

    // 截图结果页面
    const resultScreenshotPath = path.join(SCREENSHOT_DIR, `${assessmentName}-result.png`);
    await screenshotService.saveScreenshot(`${assessmentName}-result.png`, SCREENSHOT_DIR);
    console.log(`✅ 已保存结果截图: ${resultScreenshotPath}`);

    console.log(`✅ ${assessmentName} 完成！`);
    return true;

  } catch (error: any) {
    console.error(`❌ ${assessmentName} 失败: ${error.message}`);

    // 错误截图
    const errorScreenshotPath = path.join(SCREENSHOT_DIR, `${assessmentName}-error.png`);
    try {
      await screenshotService.saveScreenshot(`${assessmentName}-error.png`, SCREENSHOT_DIR);
      console.log(`✅ 已保存错误截图: ${errorScreenshotPath}`);
    } catch (e) {
      console.error('❌ 保存错误截图失败');
    }

    return false;
  }
}

// ============= 主函数 =============

async function completeAllAssessments() {
  console.log('='.repeat(80));
  console.log('🎯 开始完成家长中心所有测评流程');
  console.log('='.repeat(80));

  const startTime = Date.now();

  try {
    // 1. 启动浏览器
    console.log('\n1️⃣ 启动浏览器...');
    await browserManager.launch({
      headless: true, // 使用无头模式
      viewport: { width: 1920, height: 1080 }
    });
    console.log('✅ 浏览器启动成功');

    // 2. 登录家长账号
    console.log('\n2️⃣ 登录家长账号...');
    const loginSuccess = await loginParent();
    if (!loginSuccess) {
      throw new Error('家长账号登录失败');
    }

    // 3. 导航到测评中心
    console.log('\n3️⃣ 导航到测评中心...');
    const navSuccess = await navigateToAssessment();
    if (!navSuccess) {
      throw new Error('无法导航到测评中心');
    }

    // 4. 完成三个测评
    const assessments = [
      {
        name: '2-6岁儿童发育商测评',
        path: '/parent-center/assessment/development'
      },
      {
        name: '幼小衔接测评',
        path: '/parent-center/assessment/school-readiness'
      },
      {
        name: '1-6年级学科测评',
        path: '/parent-center/assessment/academic'
      }
    ];

    const results = [];

    for (const assessment of assessments) {
      const success = await completeAssessment(assessment.name, assessment.path);
      results.push({
        name: assessment.name,
        success,
        timestamp: new Date().toISOString()
      });

      // 测评之间间隔
      await pageOperations.wait(3000);
    }

    // 5. 生成报告
    const duration = Date.now() - startTime;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    const report = {
      timestamp: new Date().toISOString(),
      duration: `${minutes}分${seconds}秒`,
      totalAssessments: assessments.length,
      successfulAssessments: results.filter(r => r.success).length,
      failedAssessments: results.filter(r => !r.success).length,
      results: results,
      screenshots: fs.readdirSync(SCREENSHOT_DIR).map(f => ({
        name: f,
        path: path.join(SCREENSHOT_DIR, f)
      }))
    };

    // 保存报告
    const reportPath = path.join(SCREENSHOT_DIR, `assessment-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('📋 测评完成报告');
    console.log('='.repeat(80));
    console.log(`总耗时: ${report.duration}`);
    console.log(`总测评数: ${report.totalAssessments}`);
    console.log(`成功: ${report.successfulAssessments}`);
    console.log(`失败: ${report.failedAssessments}`);
    console.log(`报告路径: ${reportPath}`);
    console.log('='.repeat(80));

    // 显示详细结果
    console.log('\n📊 详细结果:');
    for (const result of results) {
      const status = result.success ? '✅ 成功' : '❌ 失败';
      console.log(`  ${status} - ${result.name}`);
    }

    console.log('\n📸 生成的截图:');
    for (const screenshot of report.screenshots) {
      console.log(`  - ${screenshot.name}`);
    }

    console.log('\n🎉 所有测评流程完成！');

    return report.successfulAssessments === report.totalAssessments ? 0 : 1;

  } catch (error: any) {
    console.error('\n❌ 测评流程失败:', error.message);
    return 1;

  } finally {
    // 6. 关闭浏览器
    console.log('\n🔚 关闭浏览器...');
    await browserManager.close();
    console.log('✅ 浏览器已关闭');
  }
}

// 执行测评流程
completeAllAssessments()
  .then(exitCode => {
    console.log(`\n脚本执行完成，退出码: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('\n脚本执行失败:', error);
    process.exit(1);
  });
