const { chromium } = require('playwright');

async function detailedSidebarAnalysis() {
  console.log('=== 详细侧边栏图标分析开始 ===');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 自动登录
    console.log('🔐 自动登录...');
    await page.goto('http://localhost:5173/login');
    await page.waitForTimeout(2000);

    // 填写登录信息
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    // 确保在dashboard页面
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(3000);

    // 1. 分析当前角色和侧边栏
    console.log('\n👤 分析当前用户角色...');
    const userRole = await page.evaluate(() => {
      const userStore = window.$nuxt?.$pinia?.state.value?.user;
      return userStore?.userRole || 'unknown';
    });
    console.log(`当前用户角色: ${userRole}`);

    // 2. 检查实际显示的侧边栏组件
    console.log('\n🔍 检查实际显示的侧边栏组件...');
    const sidebarComponents = await page.evaluate(() => {
      const sidebarElement = document.querySelector('.sidebar');
      if (!sidebarElement) return null;

      // 检查子组件
      const children = Array.from(sidebarElement.children);
      const componentNames = children.map(child => {
        const className = child.className;
        const vueComponent = child.__vueParentComponent?.type?.__name;
        return { className, vueComponent };
      });

      return {
        sidebarClass: sidebarElement.className,
        children: componentNames
      };
    });

    console.log('侧边栏组件分析:', JSON.stringify(sidebarComponents, null, 2));

    // 3. 详细分析图标样式
    console.log('\n🎨 详细分析图标样式...');
    const iconAnalysis = await page.evaluate(() => {
      const icons = Array.from(document.querySelectorAll('.unified-icon, .icon-svg, i[class*="icon"], svg'));

      return icons.slice(0, 8).map((icon, index) => {
        const styles = window.getComputedStyle(icon);
        const rect = icon.getBoundingClientRect();
        const className = icon.className;

        // 检查是否是SVG元素
        const isSvg = icon.tagName === 'svg' || icon.querySelector('svg');
        const svgElement = isSvg ? (icon.tagName === 'svg' ? icon : icon.querySelector('svg')) : null;

        let svgStyles = {};
        if (svgElement) {
          svgStyles = {
            fill: window.getComputedStyle(svgElement).fill,
            stroke: window.getComputedStyle(svgElement).stroke,
            strokeWidth: window.getComputedStyle(svgElement).strokeWidth,
            color: window.getComputedStyle(svgElement).color
          };
        }

        return {
          index,
          tagName: icon.tagName,
          className,
          isVisible: styles.visibility !== 'hidden' && styles.display !== 'none',
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          styles: {
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            borderColor: styles.borderColor,
            opacity: styles.opacity,
            display: styles.display,
            visibility: styles.visibility
          },
          svgStyles
        };
      });
    });

    console.log('图标分析结果:');
    iconAnalysis.forEach(icon => {
      console.log(`图标 ${icon.index + 1}:`);
      console.log(`  - 标签: ${icon.tagName}`);
      console.log(`  - 类名: ${icon.className}`);
      console.log(`  - 可见: ${icon.isVisible}`);
      console.log(`  - 位置: (${icon.position.x}, ${icon.position.y}) ${icon.position.width}x${icon.position.height}`);
      console.log(`  - 颜色: ${icon.styles.color}`);
      console.log(`  - 背景: ${icon.styles.backgroundColor}`);
      console.log(`  - SVG填充: ${icon.svgStyles.fill}`);
      console.log(`  - SVG描边: ${icon.svgStyles.stroke}`);
      console.log(`  - SVG描边宽度: ${icon.svgStyles.strokeWidth}`);
      console.log('');
    });

    // 4. 分析侧边栏菜单项
    console.log('\n📋 分析侧边栏菜单项...');
    const menuAnalysis = await page.evaluate(() => {
      const menuItems = Array.from(document.querySelectorAll('.menu-item, [class*="menu-item"], .nav-item, .el-menu-item'));

      return menuItems.slice(0, 8).map((item, index) => {
        const text = item.textContent?.trim();
        const icon = item.querySelector('i, svg, [class*="icon"]');
        const styles = window.getComputedStyle(item);

        return {
          index,
          text,
          hasIcon: !!icon,
          isActive: styles.color && (styles.color.includes('59, 130, 246') || styles.color.includes('rgb(59, 130, 246)')),
          textColor: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
    });

    console.log('菜单项分析结果:');
    menuAnalysis.forEach(item => {
      console.log(`菜单 ${item.index + 1}: "${item.text}" (图标: ${item.hasIcon}, 激活: ${item.isActive})`);
    });

    // 5. 截图当前状态
    await page.screenshot({ path: 'current-sidebar-analysis.png', fullPage: true });
    console.log('\n📸 已截图当前状态: current-sidebar-analysis.png');

    // 6. 尝试切换角色
    console.log('\n🔄 尝试切换用户角色...');

    // 查找角色切换器
    const roleSwitcherFound = await page.evaluate(() => {
      const selectors = [
        '[class*="role"]',
        '[class*="user"]',
        '.el-dropdown',
        '[class*="switch"]',
        '.header-user-info',
        '.user-dropdown'
      ];

      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
          return {
            found: true,
            selector,
            text: element.textContent?.trim(),
            className: element.className
          };
        }
      }
      return { found: false };
    });

    if (roleSwitcherFound.found) {
      console.log(`找到角色切换器: ${roleSwitcherFound.selector}`);

      // 尝试点击角色切换器
      try {
        await page.click(roleSwitcherFound.selector);
        await page.waitForTimeout(2000);

        // 查找角色选项
        const roleOptions = await page.evaluate(() => {
          const options = Array.from(document.querySelectorAll('[class*="option"], [role="menuitem"], .el-dropdown-menu__item'));
          return options.map(opt => ({
            text: opt.textContent?.trim(),
            visible: opt.offsetParent !== null
          }));
        });

        console.log('发现角色选项:', roleOptions);

        // 尝试点击教师角色
        const teacherOption = roleOptions.find(opt => opt.text.includes('老师'));
        if (teacherOption) {
          await page.evaluate(() => {
            const options = Array.from(document.querySelectorAll('[class*="option"], [role="menuitem"], .el-dropdown-menu__item'));
            const teacherOpt = options.find(opt => opt.textContent.includes('老师'));
            if (teacherOpt) teacherOpt.click();
          });

          await page.waitForTimeout(3000);
          console.log('✅ 已切换到教师角色');

          // 再次截图教师角色的侧边栏
          await page.screenshot({ path: 'teacher-role-sidebar.png', fullPage: true });
          console.log('📸 教师角色侧边栏截图: teacher-role-sidebar.png');
        }

      } catch (error) {
        console.log(`角色切换失败: ${error.message}`);
      }
    } else {
      console.log('未找到角色切换器');
    }

    // 7. 检查CSS变量和主题
    console.log('\n🎨 检查CSS变量和主题...');
    const themeAnalysis = await page.evaluate(() => {
      const rootStyles = getComputedStyle(document.documentElement);
      const sidebarElement = document.querySelector('.sidebar');
      const sidebarStyles = sidebarElement ? getComputedStyle(sidebarElement) : null;

      return {
        cssVariables: {
          textColor: rootStyles.getPropertyValue('--el-text-color-primary')?.trim(),
          bgColor: rootStyles.getPropertyValue('--el-bg-color')?.trim(),
          primaryColor: rootStyles.getPropertyValue('--el-color-primary')?.trim()
        },
        sidebarStyles: sidebarStyles ? {
          backgroundColor: sidebarStyles.backgroundColor,
          color: sidebarStyles.color,
          borderColor: sidebarStyles.borderColor
        } : null
      };
    });

    console.log('主题分析:', JSON.stringify(themeAnalysis, null, 2));

    // 8. 检查控制台错误
    console.log('\n🔍 检查控制台消息...');
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text(),
          location: msg.location()
        });
      }
    });

    await page.waitForTimeout(2000); // 等待收集消息

    if (consoleMessages.length > 0) {
      console.log('控制台消息:');
      consoleMessages.forEach(msg => {
        console.log(`  [${msg.type.toUpperCase()}] ${msg.text}`);
      });
    } else {
      console.log('无控制台错误或警告');
    }

    // 9. 最终截图
    await page.screenshot({ path: 'final-sidebar-state.png', fullPage: true });
    console.log('\n📸 最终状态截图: final-sidebar-state.png');

  } catch (error) {
    console.error('❌ 分析过程中发生错误:', error);
  } finally {
    await browser.close();
    console.log('=== 详细侧边栏图标分析完成 ===');
  }
}

// 运行分析
detailedSidebarAnalysis().catch(console.error);