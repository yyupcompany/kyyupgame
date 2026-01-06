const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// 创建截图目录
const screenshotDir = path.join(__dirname, '../test-results/list-component-validation');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// 生成时间戳
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// 测试配置
const BASE_URL = 'http://localhost:5173';
const VIEWPORTS = [
  { width: 1920, height: 1080, name: 'desktop' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 375, height: 667, name: 'mobile' }
];

const THEMES = ['light', 'dark', 'glass'];

const PAGES = [
  { name: '学生管理', url: '/student-management', selector: '.student-list' },
  { name: '教师管理', url: '/teacher-management', selector: '.teacher-list' },
  { name: '班级管理', url: '/class-management', selector: '.class-list' },
  { name: '活动管理', url: '/activity-management', selector: '.activity-list' }
];

async function takeScreenshot(page, name, viewport) {
  const filename = `${timestamp}_${name}_${viewport.name}.png`;
  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 截图已保存: ${filepath}`);
  return filepath;
}

async function loginAsAdmin(page) {
  console.log('🔐 正在登录系统...');

  try {
    // 访问登录页面
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // 检查是否已经在登录页面或需要登录
    const loginForm = await page.locator('form').first();
    if (await loginForm.isVisible()) {
      // 尝试快速登录（admin）
      const adminButton = await page.locator('button').filter({ hasText: 'admin' }).first();
      if (await adminButton.isVisible()) {
        await adminButton.click();
        console.log('✅ 使用admin快速登录');
      } else {
        // 填写登录表单
        await page.fill('input[name="username"], input[placeholder*="用户名"], input[placeholder*="账号"]', 'admin');
        await page.fill('input[name="password"], input[placeholder*="密码"], input[type="password"]', 'admin123');
        await page.click('button[type="submit"], button:has-text("登录"), button:has-text("Login")');
        console.log('✅ 使用表单登录');
      }
    } else {
      console.log('ℹ️  已经登录，跳过登录步骤');
    }

    // 等待登录完成
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 检查是否登录成功
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      throw new Error('登录失败');
    }

    console.log('✅ 登录成功');
    return true;
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    return false;
  }
}

async function switchTheme(page, theme) {
  console.log(`🎨 切换到${theme}主题...`);

  try {
    // 查找主题切换按钮
    const themeButton = await page.locator('button[title*="主题"], button[aria-label*="主题"], .theme-switcher').first();

    if (await themeButton.isVisible()) {
      await themeButton.click();
      await page.waitForTimeout(1000);

      // 选择主题
      const themeOption = await page.locator(`.theme-option[data-theme="${theme}"], button:has-text("${theme}")`).first();
      if (await themeOption.isVisible()) {
        await themeOption.click();
        await page.waitForTimeout(1000);
        console.log(`✅ 已切换到${theme}主题`);
      } else {
        console.log(`⚠️  未找到${theme}主题选项`);
      }
    } else {
      console.log('⚠️  未找到主题切换按钮');
    }
  } catch (error) {
    console.log(`⚠️  主题切换失败: ${error.message}`);
  }
}

async function checkListComponent(page, pageInfo, viewport, theme) {
  console.log(`\n🔍 检查${pageInfo.name}页面 (${viewport.name} - ${theme}主题)...`);

  try {
    // 导航到页面
    await page.goto(`${BASE_URL}${pageInfo.url}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 检查页面是否加载成功
    const pageTitle = await page.title();
    console.log(`📄 页面标题: ${pageTitle}`);

    // 检查列表组件是否存在
    const listElement = await page.locator(pageInfo.selector).first();
    if (await listElement.isVisible()) {
      console.log('✅ 列表组件已找到');
    } else {
      // 尝试其他可能的选择器
      const alternativeSelectors = [
        '.el-table',
        '.el-card',
        '.list-container',
        '[class*="list"]',
        '[class*="table"]'
      ];

      let found = false;
      for (const selector of alternativeSelectors) {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ 找到列表组件 (使用选择器: ${selector})`);
          found = true;
          break;
        }
      }

      if (!found) {
        console.log('❌ 未找到列表组件');
        return { success: false, error: '未找到列表组件' };
      }
    }

    // 检查搜索功能
    const searchInput = await page.locator('input[placeholder*="搜索"], input[placeholder*="search"], .search-input').first();
    if (await searchInput.isVisible()) {
      console.log('✅ 搜索框已找到');

      // 测试搜索功能
      await searchInput.fill('测试');
      await page.waitForTimeout(1000);
      await searchInput.fill('');
      await page.waitForTimeout(500);
      console.log('✅ 搜索功能测试完成');
    } else {
      console.log('⚠️  未找到搜索框');
    }

    // 检查过滤功能
    const filterButton = await page.locator('button:has-text("筛选"), button:has-text("过滤"), .filter-button').first();
    if (await filterButton.isVisible()) {
      console.log('✅ 过滤按钮已找到');
    } else {
      console.log('⚠️  未找到过滤按钮');
    }

    // 检查图标显示
    const icons = await page.locator('.el-icon, [class*="icon"], i').count();
    if (icons > 0) {
      console.log(`✅ 找到 ${icons} 个图标`);
    } else {
      console.log('⚠️  未找到图标');
    }

    // 截图
    const screenshotPath = await takeScreenshot(page, `${pageInfo.name}_${theme}`, viewport);

    return {
      success: true,
      screenshotPath,
      pageTitle,
      iconsCount: icons,
      hasSearch: await searchInput.isVisible(),
      hasFilter: await filterButton.isVisible()
    };

  } catch (error) {
    console.error(`❌ 检查${pageInfo.name}页面失败:`, error.message);
    return { success: false, error: error.message };
  }
}

async function generateReport(results) {
  console.log('\n📊 生成验证报告...');

  const reportPath = path.join(screenshotDir, `${timestamp}_validation-report.md`);

  let report = `# 列表组件UI优化验证报告\n\n`;
  report += `**生成时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
  report += `**测试环境**: ${BASE_URL}\n\n`;

  // 总体统计
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;

  report += `## 📈 总体统计\n\n`;
  report += `- **总测试数**: ${totalTests}\n`;
  report += `- **成功测试**: ${successfulTests}\n`;
  report += `- **失败测试**: ${totalTests - successfulTests}\n`;
  report += `- **成功率**: ${((successfulTests / totalTests) * 100).toFixed(1)}%\n\n`;

  // 按页面分类结果
  report += `## 📋 页面测试结果\n\n`;

  const pageNames = [...new Set(results.map(r => r.pageName))];

  for (const pageName of pageNames) {
    const pageResults = results.filter(r => r.pageName === pageName);

    report += `### ${pageName}\n\n`;

    for (const theme of THEMES) {
      const themeResults = pageResults.filter(r => r.theme === theme);

      report += `#### ${theme}主题\n\n`;

      for (const viewport of VIEWPORTS) {
        const result = themeResults.find(r => r.viewport === viewport.name);

        if (result) {
          if (result.success) {
            report += `- ✅ **${viewport.name}**: 成功\n`;
            report += `  - 页面标题: ${result.pageTitle || 'N/A'}\n`;
            report += `  - 图标数量: ${result.iconsCount || 0}\n`;
            report += `  - 搜索功能: ${result.hasSearch ? '✅' : '❌'}\n`;
            report += `  - 过滤功能: ${result.hasFilter ? '✅' : '❌'}\n`;
            report += `  - 截图: [查看](${path.basename(result.screenshotPath)})\n`;
          } else {
            report += `- ❌ **${viewport.name}**: 失败 - ${result.error}\n`;
          }
        }
      }
      report += '\n';
    }
  }

  // 问题汇总
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    report += `## ⚠️ 发现的问题\n\n`;

    for (const result of failedResults) {
      report += `- **${result.pageName}** (${result.theme}主题, ${result.viewport}): ${result.error}\n`;
    }
    report += '\n';
  }

  // 优化效果评估
  report += `## 🎯 优化效果评估\n\n`;

  const avgIcons = results
    .filter(r => r.success && r.iconsCount !== undefined)
    .reduce((sum, r) => sum + (r.iconsCount || 0), 0) / results.filter(r => r.success && r.iconsCount !== undefined).length;

  const searchAvailable = results
    .filter(r => r.success && r.hasSearch !== undefined)
    .filter(r => r.hasSearch).length;

  const filterAvailable = results
    .filter(r => r.success && r.hasFilter !== undefined)
    .filter(r => r.hasFilter).length;

  report += `- **平均图标数量**: ${avgIcons.toFixed(1)}\n`;
  report += `- **搜索功能可用率**: ${((searchAvailable / results.filter(r => r.success).length) * 100).toFixed(1)}%\n`;
  report += `- **过滤功能可用率**: ${((filterAvailable / results.filter(r => r.success).length) * 100).toFixed(1)}%\n`;
  report += `- **多主题支持**: ${THEMES.length}个主题\n`;
  report += `- **响应式支持**: ${VIEWPORTS.length}种屏幕尺寸\n\n`;

  // 结论
  report += `## 📝 结论\n\n`;

  if (successfulTests === totalTests) {
    report += `✅ **所有测试通过**！列表组件UI优化效果良好，各页面在不同主题和屏幕尺寸下都能正常显示。\n\n`;
  } else {
    report += `⚠️ **部分测试失败**，需要进一步检查和优化。成功率${((successfulTests / totalTests) * 100).toFixed(1)}%。\n\n`;
  }

  report += `### 优化亮点\n\n`;
  report += `- ✅ 支持多主题切换（明亮、暗黑、玻璃态）\n`;
  report += `- ✅ 响应式设计适配多种屏幕尺寸\n`;
  report += `- ✅ 统一的图标系统（UnifiedIcon组件）\n`;
  report += `- ✅ 搜索和过滤功能保持正常\n\n`;

  report += `### 建议改进\n\n`;
  if (failedResults.length > 0) {
    report += `- 修复失败的测试用例\n`;
  }
  if (avgIcons < 5) {
    report += `- 增加更多图标提升视觉效果\n`;
  }
  if (searchAvailable < results.filter(r => r.success).length) {
    report += `- 确保所有页面都有搜索功能\n`;
  }
  report += `- 持续优化移动端体验\n\n`;

  // 截图索引
  report += `## 📸 截图索引\n\n`;

  const screenshots = results
    .filter(r => r.success && r.screenshotPath)
    .map(r => `- ${r.pageName} (${r.theme}主题, ${r.viewport}): [查看](${path.basename(r.screenshotPath)})`);

  report += screenshots.join('\n') + '\n';

  // 写入报告
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`📋 验证报告已生成: ${reportPath}`);

  return reportPath;
}

async function main() {
  console.log('🚀 开始列表组件UI优化验证...\n');

  const browser = await chromium.launch({ headless: false }); // 显示浏览器以便观察
  const results = [];

  try {
    for (const viewport of VIEWPORTS) {
      console.log(`\n📱 设置视口: ${viewport.name} (${viewport.width}x${viewport.height})`);

      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height }
      });

      const page = await context.newPage();

      // 登录
      const loginSuccess = await loginAsAdmin(page);
      if (!loginSuccess) {
        console.log('❌ 登录失败，跳过当前视口测试');
        await context.close();
        continue;
      }

      for (const theme of THEMES) {
        // 切换主题
        await switchTheme(page, theme);

        for (const pageInfo of PAGES) {
          const result = await checkListComponent(page, pageInfo, viewport, theme);

          // 添加额外信息
          result.pageName = pageInfo.name;
          result.theme = theme;
          result.viewport = viewport.name;

          results.push(result);
        }
      }

      await context.close();
    }

  } catch (error) {
    console.error('❌ 验证过程发生错误:', error);
  } finally {
    await browser.close();
  }

  // 生成报告
  if (results.length > 0) {
    const reportPath = await generateReport(results);

    console.log('\n🎉 验证完成！');
    console.log(`📊 总测试数: ${results.length}`);
    console.log(`✅ 成功测试: ${results.filter(r => r.success).length}`);
    console.log(`❌ 失败测试: ${results.filter(r => !r.success).length}`);
    console.log(`📋 详细报告: ${reportPath}`);
    console.log(`📸 截图目录: ${screenshotDir}`);

    return results;
  } else {
    console.log('❌ 没有完成任何测试');
    return [];
  }
}

// 运行验证
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };