const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testParentAssessment() {
  console.log('🚀 开始家长端测评中心完整功能测试\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  });

  const page = await context.newPage();

  // 监听控制台错误
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`🔴 控制台错误: ${msg.text()}`);
    }
  });

  // 监听页面错误
  const pageErrors = [];
  page.on('pageerror', error => {
    console.log(`🔴 页面错误: ${error.message}`);
    pageErrors.push(error.message);
  });

  try {
    console.log('📍 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // 等待页面加载完成
    await page.waitForTimeout(2000);

    console.log('📍 步骤2: 登录系统');

    // 查找登录表单
    await page.waitForSelector('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]', { timeout: 10000 });

    // 填写登录信息
    await page.fill('input[placeholder*="用户名"], input[placeholder*="账号"], input[name="username"]', 'testparent');
    await page.fill('input[placeholder*="密码"], input[name="password"]', '123456');

    // 点击登录按钮
    await page.click('button[type="submit"], button:has-text("登录"), .el-button:has-text("登录")');

    // 等待登录成功
    await page.waitForTimeout(3000);

    console.log('📍 步骤3: 检查登录状态和侧边栏');

    // 检查是否登录成功
    const currentUrl = page.url();
    console.log(`当前页面URL: ${currentUrl}`);

    // 查找家长侧边栏或导航
    let hasSidebar = false;
    try {
      await page.waitForSelector('.sidebar, .el-menu, nav, .navigation', { timeout: 5000 });
      hasSidebar = true;
      console.log('✅ 侧边栏已显示');
    } catch (e) {
      console.log('⚠️ 未找到侧边栏，可能登录失败或页面结构不同');
    }

    if (hasSidebar) {
      // 查找测评中心相关菜单
      console.log('📍 步骤4: 查找测评中心入口');

      const assessmentKeywords = ['测评', 'assessment', '评价', '测试'];
      let assessmentLink = null;

      for (const keyword of assessmentKeywords) {
        try {
          const links = await page.locator(`a:has-text("${keyword}"), .el-menu-item:has-text("${keyword}")`).all();
          if (links.length > 0) {
            assessmentLink = links[0];
            console.log(`✅ 找到测评相关菜单: ${keyword}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (assessmentLink) {
        await assessmentLink.click();
        await page.waitForTimeout(2000);

        console.log('📍 步骤5: 进入测评中心页面');

        // 检查测评中心页面内容
        const pageContent = await page.content();

        // 查找不同类型的测评
        const assessmentTypes = [
          { name: '儿童发育商测评', keywords: ['发育', 'development', '商数'] },
          { name: '幼小衔接测评', keywords: ['幼小', '衔接', 'transition'] },
          { name: '1-6年级学科测评', keywords: ['年级', '学科', 'grade'] }
        ];

        for (const assessmentType of assessmentTypes) {
          console.log(`\n🔍 测试 ${assessmentType.name}:`);

          let found = false;
          for (const keyword of assessmentType.keywords) {
            if (pageContent.includes(keyword)) {
              found = true;
              break;
            }
          }

          if (found) {
            console.log(`✅ 找到 ${assessmentType.name} 相关内容`);

            // 尝试点击进入该测评
            const typeKeywords = assessmentType.keywords.slice(0, 2);
            for (const keyword of typeKeywords) {
              try {
                const link = await page.locator(`a:has-text("${keyword}"), button:has-text("${keyword}"), .el-button:has-text("${keyword}")`).first();
                if (await link.isVisible()) {
                  await link.click();
                  await page.waitForTimeout(2000);

                  console.log(`✅ 成功进入 ${assessmentType.name} 页面`);

                  // 检查是否有测评题目或开始按钮
                  const hasQuestions = await page.locator('.question, .quiz, .test, [class*="question"], [class*="quiz"]').count() > 0;
                  const hasStartButton = await page.locator('button:has-text("开始"), button:has-text("start"), .el-button:has-text("开始")').count() > 0;

                  if (hasStartButton) {
                    console.log(`✅ 找到开始测评按钮`);
                    // 尝试点击开始按钮
                    await page.click('button:has-text("开始"), button:has-text("start"), .el-button:has-text("开始")');
                    await page.waitForTimeout(3000);
                  }

                  if (hasQuestions) {
                    console.log(`✅ 找到测评题目`);

                    // 尝试回答几个问题
                    const questionCount = await page.locator('.question, [class*="question"]').count();
                    console.log(`📝 发现 ${questionCount} 个问题`);

                    // 模拟答题
                    for (let i = 0; i < Math.min(questionCount, 3); i++) {
                      try {
                        const question = await page.locator('.question, [class*="question"]').nth(i);
                        const options = await question.locator('input[type="radio"], input[type="checkbox"], .el-radio, .el-checkbox').all();

                        if (options.length > 0) {
                          await options[0].click();
                          console.log(`✅ 回答了第 ${i + 1} 个问题`);
                        }
                      } catch (e) {
                        console.log(`⚠️ 第 ${i + 1} 个问题答题失败: ${e.message}`);
                      }
                    }

                    // 尝试提交
                    try {
                      const submitButton = await page.locator('button:has-text("提交"), button:has-text("完成"), .el-button:has-text("提交")').first();
                      if (await submitButton.isVisible()) {
                        await submitButton.click();
                        await page.waitForTimeout(3000);
                        console.log(`✅ 提交了测评答案`);
                      }
                    } catch (e) {
                      console.log(`⚠️ 提交测评失败: ${e.message}`);
                    }
                  } else {
                    console.log(`⚠️ 未找到测评题目`);
                  }

                  // 返回测评中心列表
                  await page.goBack();
                  await page.waitForTimeout(1000);
                  break;
                }
              } catch (e) {
                console.log(`⚠️ 无法点击 ${keyword} 链接: ${e.message}`);
              }
            }
          } else {
            console.log(`❌ 未找到 ${assessmentType.name} 相关内容`);
          }
        }
      } else {
        console.log('❌ 未找到测评中心入口');

        // 检查是否有其他相关页面
        console.log('🔍 检查页面中可能的测评相关链接...');
        const allLinks = await page.locator('a, button, .el-button').all();
        for (let i = 0; i < allLinks.length; i++) {
          try {
            const text = await allLinks[i].textContent();
            if (text && (text.includes('测') || text.includes('评') || text.includes('试'))) {
              console.log(`发现可能的测评链接: ${text.trim()}`);
            }
          } catch (e) {
            // 忽略获取文本失败的情况
          }
        }
      }
    }

    // 截图保存测试结果
    const screenshotPath = path.join(__dirname, 'parent-assessment-test-result.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 测试截图已保存: ${screenshotPath}`);

    // 检查是否有控制台错误
    if (consoleErrors.length > 0) {
      console.log('\n🔴 发现控制台错误:');
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ 未发现控制台错误');
    }

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);

    // 错误时也保存截图
    const errorScreenshotPath = path.join(__dirname, 'parent-assessment-test-error.png');
    await page.screenshot({ path: errorScreenshotPath, fullPage: true });
    console.log(`📸 错误截图已保存: ${errorScreenshotPath}`);

  } finally {
    await browser.close();
  }
}

// 运行测试
testParentAssessment().catch(console.error);