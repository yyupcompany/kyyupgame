const { chromium } = require('playwright');

async function checkSidebarIcons() {
  console.log('=== 侧边栏图标检查开始 ===');

  const browser = await chromium.launch({
    headless: false, // 显示浏览器以便观察
    slowMo: 1000 // 慢速操作以便观察
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 设置视口
    await page.setViewportSize({ width: 1920, height: 1080 });

    console.log('🌐 访问 dashboard 页面...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 检查页面是否正确加载
    const pageTitle = await page.title();
    console.log(`📄 页面标题: ${pageTitle}`);

    // 检查是否存在侧边栏
    const sidebars = await page.$$('.sidebar, .aside, [class*="sidebar"], [class*="aside"]');
    console.log(`📊 发现侧边栏数量: ${sidebars.length}`);

    if (sidebars.length === 0) {
      console.log('❌ 未发现侧边栏，可能是加载问题');
      // 尝试截图当前页面状态
      await page.screenshot({ path: 'dashboard-no-sidebar.png', fullPage: true });
      console.log('📸 已截图: dashboard-no-sidebar.png');
    }

    // 查找图标元素
    const iconSelectors = [
      'i[class*="el-icon"]', // Element UI图标
      'i[class*="icon"]', // 通用图标
      '.svg-icon', // SVG图标
      'svg', // SVG元素
      '[class*="icon"]', // 包含icon的类名
      '.el-icon', // Element UI图标类
      '.menu-item i', // 菜单项中的图标
      '.sidebar-item i', // 侧边栏项目中的图标
      '.nav-item i' // 导航项中的图标
    ];

    let allIcons = [];
    for (const selector of iconSelectors) {
      try {
        const icons = await page.$$(selector);
        if (icons.length > 0) {
          console.log(`✅ 通过选择器 "${selector}" 找到 ${icons.length} 个图标`);
          allIcons.push(...icons);
        }
      } catch (err) {
        // 忽略选择器错误
      }
    }

    // 去重图标元素
    const uniqueIcons = [...new Set(allIcons)];
    console.log(`📈 总计发现 ${uniqueIcons.length} 个唯一图标元素`);

    if (uniqueIcons.length > 0) {
      // 检查前几个图标的样式
      for (let i = 0; i < Math.min(5, uniqueIcons.length); i++) {
        const icon = uniqueIcons[i];
        try {
          const isVisible = await icon.isVisible();
          const boundingBox = await icon.boundingBox();
          const className = await icon.getAttribute('class');

          console.log(`🔍 图标 ${i + 1}:`);
          console.log(`   - 可见: ${isVisible}`);
          console.log(`   - 位置: ${boundingBox ? `(${boundingBox.x}, ${boundingBox.y})` : 'N/A'}`);
          console.log(`   - 大小: ${boundingBox ? `${boundingBox.width}x${boundingBox.height}` : 'N/A'}`);
          console.log(`   - 类名: ${className || 'N/A'}`);

          // 检查计算样式
          const computedStyle = await icon.evaluate(el => {
            const style = window.getComputedStyle(el);
            return {
              display: style.display,
              visibility: style.visibility,
              opacity: style.opacity,
              color: style.color,
              backgroundColor: style.backgroundColor,
              borderColor: style.borderColor,
              fill: style.fill,
              stroke: style.stroke
            };
          });

          console.log(`   - 样式:`, computedStyle);
        } catch (err) {
          console.log(`   - 检查失败: ${err.message}`);
        }
      }
    }

    // 检查菜单项
    const menuItems = await page.$$('.menu-item, [class*="menu-item"], .nav-item, [class*="nav-item"]');
    console.log(`📋 发现菜单项数量: ${menuItems.length}`);

    if (menuItems.length > 0) {
      for (let i = 0; i < Math.min(3, menuItems.length); i++) {
        const item = menuItems[i];
        try {
          const text = await item.textContent();
          const isVisible = await item.isVisible();
          console.log(`📝 菜单项 ${i + 1}: "${text?.trim()}" (可见: ${isVisible})`);
        } catch (err) {
          console.log(`   - 菜单项检查失败: ${err.message}`);
        }
      }
    }

    // 检查控制台错误
    console.log('\n🔍 检查控制台错误...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 控制台错误: ${msg.text()}`);
      }
    });

    // 尝试点击菜单项以展开子菜单
    console.log('\n🖱️ 尝试点击菜单项...');
    const clickableItems = await page.$$('.menu-item, [class*="menu"]:not([disabled])');

    for (let i = 0; i < Math.min(3, clickableItems.length); i++) {
      try {
        await clickableItems[i].click();
        await page.waitForTimeout(1000);
        console.log(`✅ 点击菜单项 ${i + 1} 成功`);
      } catch (err) {
        console.log(`❌ 点击菜单项 ${i + 1} 失败: ${err.message}`);
      }
    }

    // 最终截图
    await page.screenshot({ path: 'sidebar-icons-final.png', fullPage: true });
    console.log('📸 最终截图已保存: sidebar-icons-final.png');

    // 检查不同角色切换
    console.log('\n👤 检查角色切换...');
    const roleSwitchers = await page.$$('[class*="role"], [class*="user"], .el-dropdown, [class*="switch"]');

    if (roleSwitchers.length > 0) {
      console.log(`🔄 发现 ${roleSwitchers.length} 个可能的角色切换器`);

      // 尝试点击第一个角色切换器
      try {
        await roleSwitchers[0].click();
        await page.waitForTimeout(2000);

        // 检查是否出现了角色选项
        const roleOptions = await page.$$('[class*="option"], [role="menuitem"], .el-dropdown-menu__item');
        console.log(`📋 发现 ${roleOptions.length} 个角色选项`);

        // 尝试点击教师角色
        const teacherOption = roleOptions.find(option => {
          const text = option.textContent();
          return text && text.includes('老师');
        });

        if (teacherOption) {
          await teacherOption.click();
          await page.waitForTimeout(3000);
          console.log('✅ 已切换到教师角色');

          // 再次截图教师角色的侧边栏
          await page.screenshot({ path: 'sidebar-teacher-role.png', fullPage: true });
          console.log('📸 教师角色侧边栏截图: sidebar-teacher-role.png');
        }
      } catch (err) {
        console.log(`❌ 角色切换失败: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error);
  } finally {
    await browser.close();
    console.log('=== 侧边栏图标检查完成 ===');
  }
}

// 运行检查
checkSidebarIcons().catch(console.error);