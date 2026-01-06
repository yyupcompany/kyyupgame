const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function darkModeCardStyleCheck() {
  console.log('🌙 暗黑模式卡片样式专项检查');
  console.log('=====================================');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
    devtools: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // 创建截图保存目录
  const screenshotDir = path.join(__dirname, 'docs/检查中心文档模板库');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  try {
    console.log('\n=== 步骤1：登录系统 ===');

    // 访问主页面（可能自动重定向到登录）
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    // 检查当前页面
    const currentUrl = page.url();
    console.log('当前页面URL:', currentUrl);

    // 尝试找到登录表单的多种选择器
    const loginSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[placeholder*="用户"]',
      'input[placeholder*="账号"]',
      'input[placeholder*="邮箱"]',
      '.el-input input',
      'input[name="username"]',
      'input[name="email"]'
    ];

    let usernameInput = null;
    for (const selector of loginSelectors) {
      const element = page.locator(selector).first();
      const count = await element.count();
      if (count > 0) {
        usernameInput = element;
        console.log(`找到用户名输入框: ${selector}`);
        break;
      }
    }

    if (!usernameInput) {
      console.log('⚠️ 未找到用户名输入框，尝试手动导航到登录页');
      // 尝试访问登录页面
      await page.goto('http://localhost:5173/login');
      await page.waitForTimeout(3000);

      // 重新查找输入框
      for (const selector of loginSelectors) {
        const element = page.locator(selector).first();
        const count = await element.count();
        if (count > 0) {
          usernameInput = element;
          console.log(`在登录页面找到用户名输入框: ${selector}`);
          break;
        }
      }
    }

    if (!usernameInput) {
      throw new Error('无法找到登录输入框，请检查页面是否正确加载');
    }

    // 查找密码输入框
    const passwordSelectors = [
      'input[type="password"]',
      'input[placeholder*="密码"]',
      '.el-input--password input',
      'input[name="password"]'
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
      const element = page.locator(selector).first();
      const count = await element.count();
      if (count > 0) {
        passwordInput = element;
        console.log(`找到密码输入框: ${selector}`);
        break;
      }
    }

    if (!passwordInput) {
      throw new Error('无法找到密码输入框');
    }

    // 查找登录按钮
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("登录")',
      '.el-button--primary',
      'button:has-text("登 录")',
      'button:has-text("LOGIN")',
      '.login-btn'
    ];

    let submitButton = null;
    for (const selector of submitSelectors) {
      const element = page.locator(selector).first();
      const count = await element.count();
      if (count > 0) {
        submitButton = element;
        console.log(`找到登录按钮: ${selector}`);
        break;
      }
    }

    if (!submitButton) {
      throw new Error('无法找到登录按钮');
    }

    // 执行登录
    console.log('开始填写登录信息...');
    try {
      // 方法1：尝试直接点击
      await usernameInput.click({ timeout: 5000 });
    } catch (error) {
      console.log('点击失败，尝试填充方法2...');
    }

    await usernameInput.fill('admin');
    await page.waitForTimeout(1000);

    try {
      await passwordInput.click({ timeout: 5000 });
    } catch (error) {
      console.log('密码框点击失败，继续尝试填充...');
    }

    await passwordInput.fill('123456');
    await page.waitForTimeout(1000);

    console.log('点击登录按钮...');
    try {
      await submitButton.click({ timeout: 5000 });
    } catch (error) {
      console.log('点击登录按钮失败，尝试按回车键...');
      await page.keyboard.press('Tab'); // 切换到登录按钮
      await page.keyboard.press('Enter');
    }

    // 等待登录完成，更长的等待时间
    console.log('等待登录完成...');
    await page.waitForTimeout(10000);

    // 检查是否成功跳转到dashboard
    const loginCompleteUrl = page.url();
    console.log('登录后页面URL:', loginCompleteUrl);
    if (loginCompleteUrl.includes('dashboard') || loginCompleteUrl.includes('home') || !loginCompleteUrl.includes('login')) {
      console.log('✅ 登录成功，已跳转到dashboard或主页');
    } else {
      console.log('⚠️ 登录后未跳转到预期页面，当前URL:', loginCompleteUrl);
    }

    console.log('\n=== 步骤2：明亮模式状态检查和截图 ===');

    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 明亮模式截图
    const lightModeScreenshot = path.join(screenshotDir, `${timestamp}_明亮模式页面截图.png`);
    await page.screenshot({
      path: lightModeScreenshot,
      fullPage: true
    });
    console.log(`✅ 明亮模式截图已保存: ${lightModeScreenshot}`);

    // 检查明亮模式下的卡片样式
    const lightModeCardStyles = await page.evaluate(() => {
      const getCardInfo = (selector, name) => {
        const elements = Array.from(document.querySelectorAll(selector));
        return elements.slice(0, 3).map((el, index) => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return {
            name: `${name}_${index + 1}`,
            selector: selector,
            className: el.className,
            tagName: el.tagName,
            styles: {
              backgroundColor: style.backgroundColor,
              borderColor: style.borderColor,
              borderStyle: style.borderStyle,
              borderWidth: style.borderWidth,
              borderRadius: style.borderRadius,
              boxShadow: style.boxShadow,
              color: style.color,
              background: style.background,
            },
            position: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            }
          };
        });
      };

      // 检查各种可能的卡片选择器
      const cardSelectors = [
        { selector: '.el-card', name: 'el-card' },
        { selector: '.card', name: 'card' },
        { selector: '[class*="card"]', name: 'card-containing' },
        { selector: '.dashboard-card', name: 'dashboard-card' },
        { selector: '.el-card__body', name: 'el-card-body' },
        { selector: '.content-card', name: 'content-card' },
        { selector: '.info-card', name: 'info-card' },
        { selector: '.stats-card', name: 'stats-card' }
      ];

      let allCards = [];
      cardSelectors.forEach(({ selector, name }) => {
        const cards = getCardInfo(selector, name);
        if (cards.length > 0) {
          allCards = allCards.concat(cards);
        }
      });

      // 检查CSS变量
      const root = document.documentElement;
      const rootStyle = window.getComputedStyle(root);
      const cssVariables = {
        '--el-bg-color': rootStyle.getPropertyValue('--el-bg-color'),
        '--el-bg-color-page': rootStyle.getPropertyValue('--el-bg-color-page'),
        '--el-bg-color-overlay': rootStyle.getPropertyValue('--el-bg-color-overlay'),
        '--el-border-color': rootStyle.getPropertyValue('--el-border-color'),
        '--el-border-color-light': rootStyle.getPropertyValue('--el-border-color-light'),
        '--el-text-color-primary': rootStyle.getPropertyValue('--el-text-color-primary'),
        '--el-text-color-regular': rootStyle.getPropertyValue('--el-text-color-regular'),
        '--el-box-shadow': rootStyle.getPropertyValue('--el-box-shadow'),
        '--el-box-shadow-light': rootStyle.getPropertyValue('--el-box-shadow-light'),
        '--el-box-shadow-base': rootStyle.getPropertyValue('--el-box-shadow-base')
      };

      return {
        cards: allCards,
        cssVariables: cssVariables,
        bodyClasses: document.body.className,
        htmlClasses: document.documentElement.className,
        hasDarkTheme: document.body.classList.contains('dark') || document.documentElement.classList.contains('dark')
      };
    });

    console.log('明亮模式卡片样式检查结果:');
    console.log(`  找到卡片数量: ${lightModeCardStyles.cards.length}`);
    lightModeCardStyles.cards.forEach((card, index) => {
      console.log(`  卡片${index + 1} (${card.name}):`);
      console.log(`    背景色: ${card.styles.backgroundColor}`);
      console.log(`    边框色: ${card.styles.borderColor}`);
      console.log(`    边框宽度: ${card.styles.borderWidth}`);
      console.log(`    阴影: ${card.styles.boxShadow}`);
      console.log(`    文字颜色: ${card.styles.color}`);
    });
    console.log(`  CSS变量 --el-bg-color: ${lightModeCardStyles.cssVariables['--el-bg-color']}`);
    console.log(`  CSS变量 --el-border-color: ${lightModeCardStyles.cssVariables['--el-border-color']}`);

    console.log('\n=== 步骤3：切换到暗黑模式 ===');

    // 尝试多种方式找到并点击主题切换按钮
    const themeToggleSelectors = [
      '.theme-toggle',
      '[class*="theme"]',
      '[class*="dark"]',
      'button:has-text("主题")',
      'button:has-text("dark")',
      'button:has-text("light")',
      '.el-switch',  // Element Plus开关组件
      '.theme-switch',
      '[data-theme-toggle]'
    ];

    let themeToggleClicked = false;

    for (const selector of themeToggleSelectors) {
      const element = page.locator(selector).first();
      const count = await element.count();
      if (count > 0) {
        console.log(`找到主题切换按钮: ${selector}`);
        try {
          await element.click();
          await page.waitForTimeout(2000);
          themeToggleClicked = true;
          console.log('✅ 已点击主题切换按钮');
          break;
        } catch (error) {
          console.log(`点击 ${selector} 失败:`, error.message);
        }
      }
    }

    if (!themeToggleClicked) {
      console.log('⚠️ 未找到主题切换按钮，尝试通过JavaScript切换主题');

      // 尝试通过JavaScript切换主题
      const themeSwitchResult = await page.evaluate(() => {
        // 尝试添加dark类
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');

        // 检查是否有主题切换函数
        if (window.toggleTheme) {
          window.toggleTheme();
          return 'window.toggleTheme() called';
        }

        if (window.switchTheme) {
          window.switchTheme('dark');
          return 'window.switchTheme() called';
        }

        // 尝试触发主题变化事件
        const themeEvent = new CustomEvent('themechange', { detail: { theme: 'dark' } });
        document.dispatchEvent(themeEvent);

        return 'manual dark class added';
      });

      console.log('主题切换尝试:', themeSwitchResult);
      await page.waitForTimeout(3000);
    }

    console.log('\n=== 步骤4：暗黑模式状态检查和截图 ===');

    // 暗黑模式截图
    const darkModeScreenshot = path.join(screenshotDir, `${timestamp}_暗黑模式页面截图.png`);
    await page.screenshot({
      path: darkModeScreenshot,
      fullPage: true
    });
    console.log(`✅ 暗黑模式截图已保存: ${darkModeScreenshot}`);

    // 检查暗黑模式下的卡片样式
    const darkModeCardStyles = await page.evaluate(() => {
      const getCardInfo = (selector, name) => {
        const elements = Array.from(document.querySelectorAll(selector));
        return elements.slice(0, 3).map((el, index) => {
          const style = window.getComputedStyle(el);
          return {
            name: `${name}_${index + 1}`,
            selector: selector,
            className: el.className,
            tagName: el.tagName,
            styles: {
              backgroundColor: style.backgroundColor,
              borderColor: style.borderColor,
              borderStyle: style.borderStyle,
              borderWidth: style.borderWidth,
              borderRadius: style.borderRadius,
              boxShadow: style.boxShadow,
              color: style.color,
              background: style.background,
            }
          };
        });
      };

      const cardSelectors = [
        { selector: '.el-card', name: 'el-card' },
        { selector: '.card', name: 'card' },
        { selector: '[class*="card"]', name: 'card-containing' },
        { selector: '.dashboard-card', name: 'dashboard-card' },
        { selector: '.el-card__body', name: 'el-card-body' },
        { selector: '.content-card', name: 'content-card' }
      ];

      let allCards = [];
      cardSelectors.forEach(({ selector, name }) => {
        const cards = getCardInfo(selector, name);
        if (cards.length > 0) {
          allCards = allCards.concat(cards);
        }
      });

      const root = document.documentElement;
      const rootStyle = window.getComputedStyle(root);
      const cssVariables = {
        '--el-bg-color': rootStyle.getPropertyValue('--el-bg-color'),
        '--el-bg-color-page': rootStyle.getPropertyValue('--el-bg-color-page'),
        '--el-bg-color-overlay': rootStyle.getPropertyValue('--el-bg-color-overlay'),
        '--el-border-color': rootStyle.getPropertyValue('--el-border-color'),
        '--el-border-color-light': rootStyle.getPropertyValue('--el-border-color-light'),
        '--el-text-color-primary': rootStyle.getPropertyValue('--el-text-color-primary'),
        '--el-box-shadow': rootStyle.getPropertyValue('--el-box-shadow'),
        '--el-box-shadow-light': rootStyle.getPropertyValue('--el-box-shadow-light')
      };

      return {
        cards: allCards,
        cssVariables: cssVariables,
        bodyClasses: document.body.className,
        htmlClasses: document.documentElement.className,
        hasDarkTheme: document.body.classList.contains('dark') || document.documentElement.classList.contains('dark')
      };
    });

    console.log('暗黑模式卡片样式检查结果:');
    console.log(`  找到卡片数量: ${darkModeCardStyles.cards.length}`);
    darkModeCardStyles.cards.forEach((card, index) => {
      console.log(`  卡片${index + 1} (${card.name}):`);
      console.log(`    背景色: ${card.styles.backgroundColor}`);
      console.log(`    边框色: ${card.styles.borderColor}`);
      console.log(`    边框宽度: ${card.styles.borderWidth}`);
      console.log(`    阴影: ${card.styles.boxShadow}`);
      console.log(`    文字颜色: ${card.styles.color}`);
    });
    console.log(`  CSS变量 --el-bg-color: ${darkModeCardStyles.cssVariables['--el-bg-color']}`);
    console.log(`  CSS变量 --el-border-color: ${darkModeCardStyles.cssVariables['--el-border-color']}`);
    console.log(`  暗黑主题类: ${darkModeCardStyles.hasDarkTheme ? '✅ 存在' : '❌ 不存在'}`);

    console.log('\n=== 步骤5：对比分析和问题识别 ===');

    // 对比分析
    const comparison = {
      cssVariablesChanged: {},
      cardStyleChanges: [],
      themeSwitchSuccess: darkModeCardStyles.hasDarkTheme !== lightModeCardStyles.hasDarkTheme
    };

    // 检查CSS变量变化
    Object.keys(lightModeCardStyles.cssVariables).forEach(key => {
      comparison.cssVariablesChanged[key] =
        lightModeCardStyles.cssVariables[key] !== darkModeCardStyles.cssVariables[key];
    });

    // 检查卡片样式变化
    const maxCards = Math.min(lightModeCardStyles.cards.length, darkModeCardStyles.cards.length);
    for (let i = 0; i < maxCards; i++) {
      const lightCard = lightModeCardStyles.cards[i];
      const darkCard = darkModeCardStyles.cards[i];

      if (lightCard && darkCard && lightCard.name === darkCard.name) {
        const changes = {
          name: lightCard.name,
          backgroundColorChanged: lightCard.styles.backgroundColor !== darkCard.styles.backgroundColor,
          borderColorChanged: lightCard.styles.borderColor !== darkCard.styles.borderColor,
          colorChanged: lightCard.styles.color !== darkCard.styles.color,
          boxShadowChanged: lightCard.styles.boxShadow !== darkCard.styles.boxShadow,
          lightMode: {
            backgroundColor: lightCard.styles.backgroundColor,
            borderColor: lightCard.styles.borderColor,
            color: lightCard.styles.color,
            boxShadow: lightCard.styles.boxShadow
          },
          darkMode: {
            backgroundColor: darkCard.styles.backgroundColor,
            borderColor: darkCard.styles.borderColor,
            color: darkCard.styles.color,
            boxShadow: darkCard.styles.boxShadow
          }
        };
        comparison.cardStyleChanges.push(changes);
      }
    }

    // 识别问题
    const issues = [];

    // 检查是否成功切换到暗黑模式
    if (!comparison.themeSwitchSuccess) {
      issues.push({
        type: 'theme-switch-failed',
        severity: 'high',
        description: '未能成功切换到暗黑模式，可能是主题切换功能未正常工作'
      });
    }

    // 检查CSS变量是否变化
    const cssVariablesChangedCount = Object.values(comparison.cssVariablesChanged).filter(Boolean).length;
    if (cssVariablesChangedCount === 0) {
      issues.push({
        type: 'css-variables-unchanged',
        severity: 'high',
        description: '主题切换后CSS变量未发生变化，可能主题系统未正确实现'
      });
    }

    // 检查卡片样式问题
    comparison.cardStyleChanges.forEach(cardChange => {
      if (!cardChange.backgroundColorChanged) {
        issues.push({
          type: 'card-background-unchanged',
          severity: 'medium',
          cardName: cardChange.name,
          description: `卡片 ${cardChange.name} 的背景色在暗黑模式下未发生变化`,
          currentColor: cardChange.lightMode.backgroundColor
        });
      }

      if (!cardChange.borderColorChanged && cardChange.lightMode.borderColor && cardChange.lightMode.borderColor !== 'rgba(0, 0, 0, 0)') {
        issues.push({
          type: 'card-border-unchanged',
          severity: 'medium',
          cardName: cardChange.name,
          description: `卡片 ${cardChange.name} 的边框色在暗黑模式下未发生变化`,
          currentColor: cardChange.lightMode.borderColor
        });
      }

      // 检查是否有白色外框问题
      if (cardChange.darkMode.borderColor === 'rgb(255, 255, 255)' || cardChange.darkMode.borderColor === '#ffffff' || cardChange.darkMode.borderColor === 'white') {
        issues.push({
          type: 'white-border-in-dark-mode',
          severity: 'high',
          cardName: cardChange.name,
          description: `卡片 ${cardChange.name} 在暗黑模式下使用了白色边框，可能导致视觉问题`,
          borderColor: cardChange.darkMode.borderColor
        });
      }
    });

    console.log('对比分析结果:');
    console.log(`  主题切换成功: ${comparison.themeSwitchSuccess ? '✅' : '❌'}`);
    console.log(`  CSS变量变化数量: ${cssVariablesChangedCount}`);
    console.log(`  卡片样式检查数量: ${comparison.cardStyleChanges.length}`);

    console.log('\n发现的问题:');
    if (issues.length === 0) {
      console.log('  ✅ 未发现明显的暗黑模式卡片样式问题');
    } else {
      issues.forEach((issue, index) => {
        const severityIcon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
        console.log(`  ${index + 1}. ${severityIcon} ${issue.type}: ${issue.description}`);
        if (issue.cardName) {
          console.log(`     影响卡片: ${issue.cardName}`);
        }
        if (issue.currentColor) {
          console.log(`     当前颜色: ${issue.currentColor}`);
        }
      });
    }

    console.log('\n=== 步骤6：控制台错误检查 ===');

    // 检查控制台错误
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push({
          type: 'error',
          text: msg.text(),
          location: msg.location()
        });
      }
    });

    // 等待一会儿收集控制台信息
    await page.waitForTimeout(3000);

    if (consoleErrors.length > 0) {
      console.log('发现控制台错误:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.text}`);
        if (error.location && error.location.url) {
          console.log(`     位置: ${error.location.url}:${error.location.lineNumber}`);
        }
      });
    } else {
      console.log('✅ 未发现控制台错误');
    }

    // 生成详细报告
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'dark-mode-card-style-check',
      results: {
        lightMode: lightModeCardStyles,
        darkMode: darkModeCardStyles,
        comparison: comparison,
        issues: issues,
        consoleErrors: consoleErrors
      },
      screenshots: {
        lightMode: lightModeScreenshot,
        darkMode: darkModeScreenshot
      },
      summary: {
        totalCardsFound: lightModeCardStyles.cards.length,
        themeSwitchSuccess: comparison.themeSwitchSuccess,
        issuesCount: issues.length,
        highSeverityIssues: issues.filter(i => i.severity === 'high').length,
        mediumSeverityIssues: issues.filter(i => i.severity === 'medium').length
      }
    };

    // 保存报告
    const reportPath = path.join(screenshotDir, `${timestamp}_暗黑模式卡片样式检查报告.md`);
    const reportContent = generateReportMarkdown(report);
    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`\n📄 详细报告已保存: ${reportPath}`);

    console.log('\n🎯 检查完成总结');
    console.log('=====================================');
    console.log(`检查时间: ${new Date().toLocaleString()}`);
    console.log(`发现卡片数量: ${report.summary.totalCardsFound}`);
    console.log(`主题切换状态: ${report.summary.themeSwitchSuccess ? '✅ 成功' : '❌ 失败'}`);
    console.log(`发现问题数量: ${report.summary.issuesCount}`);
    console.log(`高严重性问题: ${report.summary.highSeverityIssues}`);
    console.log(`中等严重性问题: ${report.summary.mediumSeverityIssues}`);

    if (report.summary.highSeverityIssues > 0) {
      console.log('\n🔴 建议立即修复的高优先级问题:');
      issues.filter(i => i.severity === 'high').forEach(issue => {
        console.log(`  • ${issue.description}`);
      });
    }

    return report;

  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
    return { success: false, error: error.message };
  } finally {
    console.log('\n⏳ 保持浏览器打开20秒供手动检查...');
    await page.waitForTimeout(20000);
    await browser.close();
    console.log('✅ 暗黑模式卡片样式检查完成！');
  }
}

function generateReportMarkdown(report) {
  const { results, screenshots, summary } = report;

  return `# 暗黑模式卡片样式检查报告

**检查时间**: ${new Date(report.timestamp).toLocaleString()}
**检查类型**: ${report.testType}

## 📊 检查概要

| 项目 | 结果 |
|------|------|
| 找到卡片数量 | ${summary.totalCardsFound} |
| 主题切换状态 | ${summary.themeSwitchSuccess ? '✅ 成功' : '❌ 失败'} |
| 发现问题数量 | ${summary.issuesCount} |
| 高严重性问题 | ${summary.highSeverityIssues} |
| 中等严重性问题 | ${summary.mediumSeverityIssues} |

## 🖼️ 截图对比

### 明亮模式
![明亮模式](${screenshots.lightMode})

### 暗黑模式
![暗黑模式](${screenshots.darkMode})

## 🎨 卡片样式分析

### 明亮模式卡片样式

${results.lightMode.cards.map(card => `
#### ${card.name}
- **选择器**: \`${card.selector}\`
- **背景色**: ${card.styles.backgroundColor}
- **边框色**: ${card.styles.borderColor}
- **边框宽度**: ${card.styles.borderWidth}
- **阴影**: ${card.styles.boxShadow}
- **文字颜色**: ${card.styles.color}
`).join('')}

### 暗黑模式卡片样式

${results.darkMode.cards.map(card => `
#### ${card.name}
- **选择器**: \`${card.selector}\`
- **背景色**: ${card.styles.backgroundColor}
- **边框色**: ${card.styles.borderColor}
- **边框宽度**: ${card.styles.borderWidth}
- **阴影**: ${card.styles.boxShadow}
- **文字颜色**: ${card.styles.color}
`).join('')}

## 🔄 样式对比

### CSS变量变化

${Object.keys(results.comparison.cssVariablesChanged).map(key =>
  `- \`--${key}\`: ${results.comparison.cssVariablesChanged[key] ? '✅ 已变化' : '❌ 未变化'}`
).join('\n')}

### 卡片样式变化

${results.comparison.cardStyleChanges.map(card => `
#### ${card.name}
- **背景色变化**: ${card.backgroundColorChanged ? '✅' : '❌'}
- **边框色变化**: ${card.borderColorChanged ? '✅' : '❌'}
- **文字颜色变化**: ${card.colorChanged ? '✅' : '❌'}
- **阴影变化**: ${card.boxShadowChanged ? '✅' : '❌'}
`).join('')}

## 🐛 发现的问题

${results.issues.length === 0 ? '✅ 未发现明显问题' : results.issues.map((issue, index) => {
  const severityIcon = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
  return `### ${index + 1}. ${severityIcon} ${issue.type}

**严重程度**: ${issue.severity}
**描述**: ${issue.description}
${issue.cardName ? `**影响卡片**: ${issue.cardName}` : ''}
${issue.currentColor ? `**当前颜色**: ${issue.currentColor}` : ''}
${issue.borderColor ? `**边框颜色**: ${issue.borderColor}` : ''}`;
}).join('\n\n')}

## 💡 修复建议

${results.issues.length === 0 ? '暂无修复建议' : results.issues.map(issue => {
  switch (issue.type) {
    case 'theme-switch-failed':
      return `
### 主题切换功能修复
1. 检查主题切换按钮的事件绑定
2. 确认主题切换函数的实现
3. 验证dark类的添加和移除机制`;

    case 'css-variables-unchanged':
      return `
### CSS变量主题适配
1. 为暗黑模式定义对应的CSS变量
2. 确保CSS变量在dark类下正确覆盖
3. 检查CSS变量作用域和优先级`;

    case 'card-background-unchanged':
      return `
### 卡片背景色适配
1. 使用CSS变量定义卡片背景色
2. 确保卡片背景色在暗黑模式下正确变化
3. 检查组件样式覆盖机制`;

    case 'card-border-unchanged':
      return `
### 卡片边框色适配
1. 使用CSS变量定义卡片边框色
2. 为暗黑模式设置合适的边框颜色
3. 避免使用硬编码的边框颜色`;

    case 'white-border-in-dark-mode':
      return `
### 白色边框问题修复
1. 在暗黑模式下避免使用纯白色边框
2. 使用半透明或深色调的边框颜色
3. 考虑使用CSS变量动态调整边框颜色`;

    default:
      return `### ${issue.type}
需要针对具体问题进行修复`;
  }
}).join('\n\n')}

## 🔧 技术细节

### 主题状态
- **明亮模式body类**: \`${results.lightMode.bodyClasses}\`
- **暗黑模式body类**: \`${results.darkMode.bodyClasses}\`
- **暗黑主题激活**: ${results.darkMode.hasDarkTheme ? '✅' : '❌'}

### CSS变量对比

| 变量 | 明亮模式 | 暗黑模式 | 变化状态 |
|------|----------|----------|----------|
${Object.keys(results.lightMode.cssVariables).map(key =>
  `| \`--${key}\` | ${results.lightMode.cssVariables[key] || '未设置'} | ${results.darkMode.cssVariables[key] || '未设置'} | ${results.comparison.cssVariablesChanged[key] ? '✅' : '❌'} |`
).join('\n')}

---

**报告生成时间**: ${new Date().toLocaleString()}
**检查工具**: MCP Playwright Browser Automation
**检查页面**: http://localhost:5173
`;
}

// 如果直接运行此文件
if (require.main === module) {
  darkModeCardStyleCheck().then(result => {
    console.log('\n🎯 暗黑模式卡片样式检查完成');
    if (result.summary) {
      console.log(`发现 ${result.summary.issuesCount} 个问题需要处理`);
    }
  }).catch(error => {
    console.error('检查失败:', error);
    process.exit(1);
  });
}

module.exports = { darkModeCardStyleCheck };