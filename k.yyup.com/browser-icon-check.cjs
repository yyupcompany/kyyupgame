const { chromium } = require('playwright');
const path = require('path');

async function checkIconDisplayIssue() {
  console.log('🚀 启动浏览器检查图标显示问题...\n');

  const browser = await chromium.launch({
    headless: false,  // 设置为true以无头模式运行
    devtools: true     // 自动打开开发者工具
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // 步骤1: 访问前端应用
    console.log('📍 步骤1: 访问 http://localhost:5173');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 检查页面是否加载成功
    const title = await page.title();
    console.log(`页面标题: ${title}`);

    // 步骤2: 执行admin快捷登录
    console.log('\n📍 步骤2: 执行admin快捷登录');

    // 查找admin登录按钮
    const adminButton = await page.locator('text=/admin.*登录/i').first();
    if (await adminButton.isVisible()) {
      console.log('✅ 找到admin登录按钮，准备点击...');
      await adminButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 已点击admin登录按钮');
    } else {
      console.log('❌ 未找到admin登录按钮，尝试其他登录方式...');
      // 尝试查找其他可能的登录按钮
      const loginButtons = await page.locator('button:has-text("登录")').all();
      console.log(`找到 ${loginButtons.length} 个登录按钮`);

      if (loginButtons.length > 0) {
        await loginButtons[0].click();
        await page.waitForTimeout(3000);
      }
    }

    // 步骤3: 检查侧边栏菜单图标
    console.log('\n📍 步骤3: 检查侧边栏菜单图标显示');

    // 等待页面加载完成
    await page.waitForTimeout(2000);

    // 查找侧边栏
    const sidebar = await page.locator('.sidebar, .el-menu, [class*="sidebar"], [class*="menu"]').first();
    if (await sidebar.isVisible()) {
      console.log('✅ 找到侧边栏');

      // 截图保存侧边栏状态
      await sidebar.screenshot({ path: 'sidebar-icons.png' });
      console.log('📸 已保存侧边栏截图: sidebar-icons.png');

      // 查找所有菜单项
      const menuItems = await page.locator('.el-menu-item, [class*="menu-item"], .menu-item').all();
      console.log(`📊 找到 ${menuItems.length} 个菜单项`);

      // 检查每个菜单项的图标
      for (let i = 0; i < Math.min(menuItems.length, 10); i++) {
        const item = menuItems[i];
        const text = await item.textContent();
        const isVisible = await item.isVisible();

        console.log(`菜单项 ${i + 1}: "${text?.trim()}" - 可见: ${isVisible}`);
      }
    } else {
      console.log('❌ 未找到侧边栏');
    }

    // 步骤4: 检查控制台错误
    console.log('\n📍 步骤4: 检查控制台错误信息');

    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });

    // 等待一段时间收集控制台消息
    await page.waitForTimeout(3000);

    // 过滤错误和警告
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');

    console.log(`\n📊 控制台统计:`);
    console.log(`- 错误数量: ${errors.length}`);
    console.log(`- 警告数量: ${warnings.length}`);

    if (errors.length > 0) {
      console.log('\n❌ 控制台错误:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.text}`);
        if (error.location) {
          console.log(`   位置: ${error.location.url}:${error.location.lineNumber}`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log('\n⚠️ 控制台警告:');
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.text}`);
      });
    }

    // 步骤5: 检查UnifiedIcon组件
    console.log('\n📍 步骤5: 检查UnifiedIcon组件渲染情况');

    // 在控制台中执行JavaScript来检查UnifiedIcon
    const iconCheckResult = await page.evaluate(() => {
      const results = {
        unifiedIconCount: 0,
        iconNames: new Set(),
        problemIcons: [],
        htmlSamples: []
      };

      // 查找所有UnifiedIcon相关的元素
      const unifiedIconElements = document.querySelectorAll('[class*="UnifiedIcon"], [data-icon], .icon');
      results.unifiedIconCount = unifiedIconElements.length;

      // 收集图标信息
      unifiedIconElements.forEach((element, index) => {
        const className = element.className;
        const iconName = element.getAttribute('data-icon') ||
                        element.getAttribute('icon') ||
                        element.textContent?.trim();

        if (iconName) {
          results.iconNames.add(iconName);
        }

        // 检查是否显示为三个杠（menu图标）
        if (iconName === 'menu' || element.textContent?.includes('☰') ||
            className.includes('menu')) {
          results.problemIcons.push({
            index,
            className,
            iconName,
            textContent: element.textContent,
            innerHTML: element.innerHTML
          });
        }

        // 保存前几个元素的HTML样本
        if (index < 5) {
          results.htmlSamples.push({
            index,
            className,
            innerHTML: element.innerHTML.substring(0, 200)
          });
        }
      });

      results.iconNames = Array.from(results.iconNames);

      return results;
    });

    console.log('📊 UnifiedIcon组件检查结果:');
    console.log(`- 找到 ${iconCheckResult.unifiedIconCount} 个图标相关元素`);
    console.log(`- 图标名称类型: ${iconCheckResult.iconNames.join(', ')}`);

    if (iconCheckResult.problemIcons.length > 0) {
      console.log('\n⚠️ 发现可能的问题图标:');
      iconCheckResult.problemIcons.forEach(icon => {
        console.log(`- 元素 ${icon.index}: ${icon.className}`);
        console.log(`  图标名: ${icon.iconName}`);
        console.log(`  内容: ${icon.textContent}`);
      });
    }

    console.log('\n📝 HTML样本 (前5个):');
    iconCheckResult.htmlSamples.forEach(sample => {
      console.log(`元素 ${sample.index}: ${sample.className}`);
      console.log(`HTML: ${sample.innerHTML}`);
      console.log('---');
    });

    // 步骤6: 检查图标映射配置
    console.log('\n📍 步骤6: 检查图标映射配置');

    const configCheckResult = await page.evaluate(() => {
      // 尝试访问window对象中的配置
      const results = {
        hasKindergartenIcons: false,
        iconMapping: null,
        errorMessage: null
      };

      try {
        // 检查是否有全局的图标配置
        if (window.kindergartenIcons) {
          results.hasKindergartenIcons = true;
          results.iconMapping = Object.keys(window.kindergartenIcons).slice(0, 10); // 只显示前10个
        }

        // 检查Vue组件中的图标使用
        const vueComponents = document.querySelectorAll('[data-v-]');
        results.vueComponentCount = vueComponents.length;

      } catch (error) {
        results.errorMessage = error.message;
      }

      return results;
    });

    console.log('📊 图标配置检查结果:');
    console.log(`- kindergartenIcons存在: ${configCheckResult.hasKindergartenIcons}`);
    console.log(`- Vue组件数量: ${configCheckResult.vueComponentCount}`);

    if (configCheckResult.iconMapping) {
      console.log(`- 图标映射示例: ${configCheckResult.iconMapping.join(', ')}`);
    }

    if (configCheckResult.errorMessage) {
      console.log(`- 错误: ${configCheckResult.errorMessage}`);
    }

    // 步骤7: 保存完整页面截图
    console.log('\n📍 步骤7: 保存完整页面截图');
    await page.screenshot({
      path: 'full-page-screenshot.png',
      fullPage: true
    });
    console.log('📸 已保存完整页面截图: full-page-screenshot.png');

    console.log('\n✅ 浏览器检查完成！');

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  } finally {
    // 保持浏览器打开30秒供手动检查
    console.log('\n⏰ 浏览器将保持打开30秒供手动检查...');
    await page.waitForTimeout(30000);

    await browser.close();
    console.log('🔚 浏览器已关闭');
  }
}

// 运行检查
checkIconDisplayIssue().catch(console.error);