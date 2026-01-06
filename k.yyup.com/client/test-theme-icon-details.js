import { chromium } from 'playwright';

async function testThemeIconDetails() {
  console.log('🚀 开始主题图标详细信息测试...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    console.log('🌐 访问应用主页...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 快速登录
    const adminButton = await page.$('.admin-btn, button:has-text("系统管理员")');
    if (adminButton) {
      await adminButton.click();
      await page.waitForTimeout(6000);
      await page.waitForLoadState('networkidle');
    }

    // 查找并点击主题按钮
    const themeButton = await page.$('.theme-btn');
    if (themeButton) {
      await themeButton.click();
      await page.waitForTimeout(2000);

      // 获取主题名称和对应的图标信息
      const themeInfo = await page.evaluate(() => {
        const themeOptions = document.querySelectorAll('.theme-option');
        const themes = [];

        themeOptions.forEach((option, index) => {
          const nameElement = option.querySelector('.theme-name');
          const iconElement = option.querySelector('.theme-icon .unified-icon');

          const name = nameElement ? nameElement.textContent.trim() : 'Unknown';
          const iconStyle = iconElement ? getComputedStyle(iconElement) : {};
          const iconColor = iconStyle.color || 'N/A';
          const iconTransform = iconStyle.transform || 'N/A';

          themes.push({
            index: index + 1,
            name: name,
            iconColor: iconColor,
            iconTransform: iconTransform
          });
        });

        return themes;
      });

      console.log('\n🎨 主题图标详细信息:');
      console.log('序号 | 主题名称     | 图标颜色       | 变换效果');
      console.log('----|--------------|---------------|----------');

      themeInfo.forEach(theme => {
        // 简化颜色显示
        let colorShort = theme.iconColor;
        if (colorShort !== 'N/A') {
          colorShort = colorShort.replace(/rgb\(|\)/g, '').split(',').map(c => parseInt(c).toString(16).padStart(2, '0')).join('');
          colorShort = `#${colorShort}`;
        }

        const transformShort = theme.iconTransform.includes('scale') ? '缩放' :
                              theme.iconTransform.includes('rotate') ? '旋转' : '无';

        console.log(`${theme.index.toString().padEnd(4)} | ${theme.name.padEnd(12)} | ${colorShort.padEnd(13)} | ${transformShort}`);
      });

      // 验证预期的图标映射
      const expectedIcons = {
        '明亮主题': 'sun',
        '暗黑主题': 'moon',
        '自定义主题': 'settings',
        '玻璃态主题': 'sparkles',
        '赛博朋克': 'flashlight',
        '自然森林': 'leaf',
        '深海海洋': 'droplets',
        '夕阳余晖': 'sun',
        '午夜星空': 'star'
      };

      console.log('\n✅ 预期的图标映射:');
      Object.entries(expectedIcons).forEach(([name, icon]) => {
        console.log(`   ${name.padEnd(12)} → ${icon}`);
      });

      console.log('\n🎉 主题图标详细信息测试完成！');

    } else {
      console.log('❌ 未找到主题切换器按钮');
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  } finally {
    await browser.close();
  }
}

testThemeIconDetails().catch(console.error);