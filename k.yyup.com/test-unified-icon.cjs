// 测试UnifiedIcon组件修复的Node.js脚本
const puppeteer = require('puppeteer');

async function testUnifiedIcons() {
  console.log('🔍 开始测试UnifiedIcon组件修复...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('📱 步骤1: 访问AI查询页面...');
    await page.goto('http://localhost:5173/ai/query');
    await page.waitForSelector('body', { timeout: 10000 });

    // 等待页面完全加载
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔍 步骤2: 检查UnifiedIcon组件是否存在...');

    // 检查是否有UnifiedIcon组件
    const hasUnifiedIcon = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(script =>
        script.textContent && script.textContent.includes('UnifiedIcon')
      );
    });

    console.log('✅ UnifiedIcon组件存在:', hasUnifiedIcon);

    console.log('🔍 步骤3: 检查上传按钮是否显示...');

    // 查找上传按钮
    const uploadButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button[title*="上传"], .icon-btn');
      return Array.from(buttons).map(btn => ({
        title: btn.getAttribute('title'),
        text: btn.textContent.trim(),
        visible: window.getComputedStyle(btn).display !== 'none',
        disabled: btn.disabled
      }));
    });

    console.log('📋 找到的上传按钮:', uploadButtons.length);
    uploadButtons.forEach((btn, index) => {
      console.log(`  按钮 ${index + 1}:`, btn);
    });

    console.log('🔍 步骤4: 检查隐藏的文件输入框...');

    // 查找隐藏的文件输入框
    const fileInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="file"]');
      return Array.from(inputs).map(input => ({
        accept: input.accept,
        display: window.getComputedStyle(input).display,
        ref: input.getAttribute('ref')
      }));
    });

    console.log('📄 找到的文件输入框:', fileInputs.length);
    fileInputs.forEach((input, index) => {
      console.log(`  输入框 ${index + 1}:`, input);
    });

    console.log('🔍 步骤5: 检查是否有SVG图标渲染...');

    // 查找SVG图标
    const svgIcons = await page.evaluate(() => {
      const svgs = document.querySelectorAll('svg');
      return Array.from(svgs).map(svg => ({
        width: svg.getAttribute('width'),
        height: svg.getAttribute('height'),
        viewBox: svg.getAttribute('viewBox'),
        hasPath: svg.querySelector('path') !== null,
        pathData: svg.querySelector('path') ? svg.querySelector('path').getAttribute('d') : null
      }));
    });

    console.log('🎨 找到的SVG图标:', svgIcons.length);

    // 检查是否有document和picture相关的SVG
    const documentIcons = svgIcons.filter(icon =>
      icon.pathData && (icon.pathData.includes('M14') || icon.pathData.includes('M21'))
    );

    console.log('📄 文档相关图标:', documentIcons.length);
    console.log('🖼️ 图片相关图标:', documentIcons.length);

    console.log('🔍 步骤6: 尝试点击上传按钮...');

    // 尝试点击上传按钮
    if (uploadButtons.length > 0) {
      for (let i = 0; i < uploadButtons.length; i++) {
        const btn = uploadButtons[i];
        if (!btn.disabled && btn.visible) {
          console.log(`🔘 点击按钮: ${btn.title}`);

          try {
            await page.evaluate((title) => {
              const button = Array.from(document.querySelectorAll('button[title*="上传"], .icon-btn'))
                .find(btn => btn.getAttribute('title') === title);
              if (button) {
                button.click();
              }
            }, btn.title);

            // 等待一下看是否有文件选择对话框
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log(`✅ 按钮 ${btn.title} 点击成功`);
          } catch (error) {
            console.log(`❌ 按钮 ${btn.title} 点击失败:`, error.message);
          }
        }
      }
    }

    console.log('📸 步骤7: 截图验证...');

    // 截图保存
    const screenshot = await page.screenshot({
      path: 'unified-icon-test.png',
      fullPage: false
    });

    console.log('📸 截图已保存: unified-icon-test.png');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log('\n✨ UnifiedIcon组件测试完成');
}

// 运行测试
testUnifiedIcons().catch(console.error);