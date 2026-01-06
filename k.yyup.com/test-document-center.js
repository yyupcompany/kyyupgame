import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDocumentCenter() {
  console.log('🚀 开始文档中心功能测试...');

  const browser = await chromium.launch({
    headless: false, // 显示浏览器窗口
    slowMo: 1000 // 慢速操作以便观察
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    // 忽略HTTPS错误
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  try {
    // 1. 访问登录页面
    console.log('📍 步骤1: 访问登录页面');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'docs/浏览器检查/01-登录页面.png' });

    // 2. 登录管理员账户
    console.log('📍 步骤2: 登录管理员账户');

    // 等待登录表单加载
    await page.waitForSelector('input[placeholder*="用户名"], input[placeholder*="账号"], input[type="text"]', { timeout: 10000 });

    // 尝试多种可能的选择器
    const usernameSelectors = [
      'input[placeholder*="用户名"]',
      'input[placeholder*="账号"]',
      'input[type="text"]',
      'input[name="username"]',
      'input[name="account"]',
      '#username',
      '#account'
    ];

    const passwordSelectors = [
      'input[placeholder*="密码"]',
      'input[type="password"]',
      'input[name="password"]',
      '#password'
    ];

    let usernameFound = false;
    let passwordFound = false;

    for (const selector of usernameSelectors) {
      try {
        await page.fill(selector, 'admin', { timeout: 2000 });
        usernameFound = true;
        console.log(`✅ 找到用户名输入框: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }

    for (const selector of passwordSelectors) {
      try {
        await page.fill(selector, 'admin123', { timeout: 2000 });
        passwordFound = true;
        console.log(`✅ 找到密码输入框: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }

    if (!usernameFound || !passwordFound) {
      console.log('❌ 未找到登录输入框，尝试检查页面内容...');
      const pageContent = await page.content();
      console.log('页面标题:', await page.title());

      // 检查是否已经登录
      if (pageContent.includes('仪表板') || pageContent.includes('dashboard') || pageContent.includes('首页')) {
        console.log('✅ 已经登录状态');
      } else {
        throw new Error('无法找到登录表单');
      }
    } else {
      // 点击登录按钮
      const loginButtonSelectors = [
        'button[type="submit"]',
        'button:has-text("登录")',
        'button:has-text("Login")',
        '.el-button--primary',
        'button.el-button'
      ];

      for (const selector of loginButtonSelectors) {
        try {
          await page.click(selector, { timeout: 2000 });
          console.log(`✅ 点击登录按钮: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }

      // 等待登录完成
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: 'docs/浏览器检查/02-登录后页面.png' });

    // 3. 导航到文档中心
    console.log('📍 步骤3: 导航到文档中心');

    // 查找文档中心相关的导航
    const documentCenterSelectors = [
      'a:has-text("文档中心")',
      'a:has-text("Document")',
      'a[href*="document"]',
      '.sidebar-item:has-text("文档")',
      'router-link:has-text("文档")',
      '[data-route*="document"]'
    ];

    let documentCenterFound = false;

    for (const selector of documentCenterSelectors) {
      try {
        await page.click(selector, { timeout: 3000 });
        console.log(`✅ 找到并点击文档中心: ${selector}`);
        documentCenterFound = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!documentCenterFound) {
      console.log('❌ 未找到文档中心导航，尝试直接访问URL...');

      // 尝试直接访问文档中心的可能URL
      const possibleUrls = [
        'http://localhost:5173/centers/document-center',
        'http://localhost:5173/document-center',
        'http://localhost:5173/document',
        'http://localhost:5173/DocumentCenter',
        'http://localhost:5173/document-template-center'
      ];

      for (const url of possibleUrls) {
        try {
          await page.goto(url, { waitUntil: 'networkidle' });
          const pageContent = await page.content();

          if (pageContent.includes('模板') || pageContent.includes('template') ||
              pageContent.includes('文档') || pageContent.includes('document')) {
            console.log(`✅ 找到文档中心页面: ${url}`);
            documentCenterFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!documentCenterFound) {
        throw new Error('无法找到文档中心页面');
      }
    }

    await page.screenshot({ path: 'docs/浏览器检查/03-文档中心页面.png' });

    // 4. 检查模板数据显示
    console.log('📍 步骤4: 检查模板数据显示');

    // 等待页面加载完成
    await page.waitForTimeout(3000);

    // 查找模板列表
    const templateSelectors = [
      '.template-list',
      '.document-list',
      '.el-table__body',
      'table tbody tr',
      '.template-card',
      '.document-item',
      '[data-testid*="template"]',
      '.template-container'
    ];

    let templateCount = 0;
    let templateElements = [];

    for (const selector of templateSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          templateElements = elements;
          console.log(`✅ 找到模板元素: ${selector}, 数量: ${elements.length}`);

          // 尝试获取更准确的模板数量
          if (selector.includes('tr')) {
            templateCount = elements.length;
          } else {
            // 对于卡片式布局，可能需要计算子元素
            for (const element of elements) {
              const text = await element.textContent();
              if (text && text.trim().length > 0) {
                templateCount++;
              }
            }
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 检查页面上的数字信息
    const pageText = await page.textContent('body');
    console.log('页面文本内容预览:', pageText.substring(0, 500));

    // 查找可能的模板数量显示
    const numberMatches = pageText.match(/\d+/g);
    if (numberMatches) {
      console.log('页面中找到的数字:', numberMatches);
    }

    // 5. 测试搜索功能
    console.log('📍 步骤5: 测试搜索功能');

    const searchSelectors = [
      'input[placeholder*="搜索"]',
      'input[placeholder*="search"]',
      '.search-input',
      '.el-input__inner',
      'input[type="search"]'
    ];

    for (const selector of searchSelectors) {
      try {
        await page.fill(selector, '模板', { timeout: 2000 });
        console.log(`✅ 找到搜索框并输入关键词: ${selector}`);

        // 等待搜索结果
        await page.waitForTimeout(2000);
        break;
      } catch (e) {
        continue;
      }
    }

    await page.screenshot({ path: 'docs/浏览器检查/04-搜索测试.png' });

    // 6. 检查分类功能
    console.log('📍 步骤6: 检查分类功能');

    const categorySelectors = [
      '.category-tabs',
      '.el-tabs__item',
      '.filter-tabs',
      '.category-buttons',
      '[role="tab"]',
      '.tab-item'
    ];

    let categories = [];

    for (const selector of categorySelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`✅ 找到分类元素: ${selector}, 数量: ${elements.length}`);

          for (const element of elements) {
            const text = await element.textContent();
            if (text && text.trim().length > 0) {
              categories.push(text.trim());
            }
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 7. 最终截图和结果汇总
    console.log('📍 步骤7: 最终截图和结果汇总');
    await page.screenshot({ path: 'docs/浏览器检查/05-完整页面.png', fullPage: true });

    // 生成测试报告
    const testResult = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      templateCount: templateCount,
      templateElements: templateElements.length,
      categories: categories,
      pageTextLength: pageText.length,
      screenshots: [
        '01-登录页面.png',
        '02-登录后页面.png',
        '03-文档中心页面.png',
        '04-搜索测试.png',
        '05-完整页面.png'
      ],
      success: true,
      issues: []
    };

    // 检查是否找到了期望的78个模板
    if (templateCount < 50) {
      testResult.issues.push(`模板数量不足: 只找到 ${templateCount} 个模板，期望78个`);
    }

    if (categories.length === 0) {
      testResult.issues.push('未找到模板分类功能');
    }

    // 保存测试报告
    const reportPath = 'docs/浏览器检查/test-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(testResult, null, 2), 'utf8');

    console.log('\n📊 测试完成！结果汇总:');
    console.log('========================');
    console.log(`✅ 访问URL: ${testResult.url}`);
    console.log(`✅ 模板数量: ${templateCount}`);
    console.log(`✅ 模板元素: ${templateElements.length}`);
    console.log(`✅ 分类数量: ${categories.length}`);
    console.log(`✅ 分类列表: ${categories.join(', ')}`);
    console.log(`✅ 截图数量: ${testResult.screenshots.length}`);

    if (testResult.issues.length > 0) {
      console.log('\n⚠️  发现的问题:');
      testResult.issues.forEach(issue => console.log(`   - ${issue}`));
    }

    console.log(`\n📄 详细报告已保存到: ${reportPath}`);

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    await page.screenshot({ path: 'docs/浏览器检查/error-screenshot.png' });

    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      url: page.url(),
      success: false
    };

    fs.writeFileSync('docs/浏览器检查/error-report.json', JSON.stringify(errorReport, null, 2), 'utf8');

  } finally {
    await browser.close();
    console.log('🏁 测试完成，浏览器已关闭');
  }
}

// 确保docs/浏览器检查目录存在
const docsDir = path.join(__dirname, 'docs', '浏览器检查');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// 运行测试
testDocumentCenter().catch(console.error);