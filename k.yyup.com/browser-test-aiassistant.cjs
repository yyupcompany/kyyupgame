/**
 * 浏览器自动化测试 - AI助手页面完整功能测试
 * 测试流程：
 * 1. 访问首页
 * 2. 使用模拟登录
 * 3. 导航到AI助手页面
 * 4. 检查页面元素和功能
 */

const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('🚀 启动浏览器测试 AI助手页面');
  console.log('='.repeat(60));

  let browser;
  try {
    // 启动浏览器
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    console.log('\n📍 步骤 1: 访问首页');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(1000);

    // 检查当前URL
    const currentUrl = page.url();
    console.log(`   当前URL: ${currentUrl}`);

    if (currentUrl.includes('/login')) {
      console.log('\n📍 步骤 2: 执行模拟登录');
      await loginAsAdmin(page);
      await sleep(2000);
    }

    console.log('\n📍 步骤 3: 导航到AI助手页面');
    await page.goto('http://localhost:5173/aiassistant', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);

    console.log('\n📋 AI助手页面功能测试结果');
    console.log('-'.repeat(60));

    // 1. 检查页面标题
    const title = await page.title();
    console.log(`✅ 页面标题: ${title}`);

    // 2. 检查AI助手容器
    const aiContainer = await page.$('.ai-assistant-container, [data-testid="ai-assistant-wrapper"]');
    if (aiContainer) {
      console.log('✅ AI助手容器已加载');
    } else {
      console.log('⚠️  AI助手容器未找到');
    }

    // 3. 检查顶部导航栏
    console.log('\n🎨 顶部导航栏检查:');
    console.log('-'.repeat(60));
    const topBar = await page.$('.ai-assistant-top-bar');
    if (topBar) {
      console.log('✅ 顶部导航栏存在');

      // 检查AI头像
      const avatar = await page.$('.ai-avatar, .top-bar-left .ai-avatar');
      if (avatar) {
        console.log('✅ AI头像存在');
      } else {
        console.log('❌ AI头像未找到');
      }

      // 检查在线状态
      const status = await page.$('.ai-status, .status-indicator');
      if (status) {
        console.log('✅ 在线状态显示正常');
      } else {
        console.log('❌ 在线状态未找到');
      }

      // 检查功能按钮
      const buttons = await page.$$eval('.icon-btn', buttons =>
        buttons.map(btn => ({
          title: btn.title || '',
          className: btn.className
        }))
      );
      console.log(`✅ 功能按钮数量: ${buttons.length}`);
      buttons.forEach((btn, index) => {
        console.log(`   ${index + 1}. [${btn.title || '无标题'}]`);
      });
    } else {
      console.log('❌ 顶部导航栏未找到');
    }

    // 4. 检查侧边栏
    console.log('\n📋 侧边栏检查:');
    console.log('-'.repeat(60));
    const sidebar = await page.$('.ai-sidebar');
    if (sidebar) {
      console.log('✅ 侧边栏存在');

      // 检查侧边栏sections
      const sections = await page.$$eval('.sidebar-section', sections =>
        sections.map(section => ({
          title: section.querySelector('.sidebar-title')?.textContent?.trim() || ''
        }))
      );
      console.log(`✅ 侧边栏分区数量: ${sections.length}`);
      sections.forEach((section, index) => {
        console.log(`   ${index + 1}. ${section.title}`);
      });

      // 检查快捷查询按钮
      const quickQueryItems = await page.$$eval('.sidebar-item[click]', items =>
        items.map(item => item.textContent?.trim())
      );
      console.log(`✅ 可点击项目数量: ${quickQueryItems.length}`);
    } else {
      console.log('❌ 侧边栏未找到');
    }

    // 5. 检查聊天区域
    console.log('\n💬 聊天区域检查:');
    console.log('-'.repeat(60));
    const chatContainer = await page.$('.chat-container');
    if (chatContainer) {
      console.log('✅ 聊天容器存在');

      // 检查欢迎消息
      const welcomeMsg = await page.$('.welcome-message');
      if (welcomeMsg) {
        console.log('✅ 欢迎消息显示正常');
        const welcomeTitle = await page.$eval('.welcome-title', el => el.textContent);
        console.log(`   标题: ${welcomeTitle}`);
      } else {
        console.log('⚠️  欢迎消息未找到（可能已有对话）');
      }

      // 检查输入框
      const input = await page.$('.message-input, textarea');
      if (input) {
        console.log('✅ 输入框存在');

        // 尝试输入测试文本
        await input.type('你好，AI助手！', { delay: 50 });
        const inputValue = await page.evaluate(el => el.value, input);
        console.log(`✅ 输入测试成功: "${inputValue}"`);
      } else {
        console.log('❌ 输入框未找到');
      }

      // 检查发送按钮
      const sendBtn = await page.$('.send-btn');
      if (sendBtn) {
        console.log('✅ 发送按钮存在');
        const disabled = await page.evaluate(el => el.disabled, sendBtn);
        console.log(`   状态: ${disabled ? '禁用' : '启用'}`);
      } else {
        console.log('❌ 发送按钮未找到');
      }
    } else {
      console.log('❌ 聊天容器未找到');
    }

    // 6. 检查图标显示
    console.log('\n🎨 图标显示检查:');
    console.log('-'.repeat(60));
    const icons = await page.evaluate(() => {
      const iconNodes = document.querySelectorAll('.unified-icon, svg[class*="icon"]');
      return Array.from(iconNodes).map(icon => {
        const name = icon.getAttribute('name') || 'no-name';
        const hasSVG = icon.querySelector('path') !== null;
        return { name, hasSVG };
      });
    });

    if (icons.length === 0) {
      console.log('⚠️  未找到图标元素');
    } else {
      console.log(`✅ 找到 ${icons.length} 个图标:`);
      icons.slice(0, 10).forEach((icon, index) => {
        const status = icon.hasSVG ? '✅' : '⚠️';
        console.log(`   ${index + 1}. ${status} ${icon.name}`);
      });
    }

    // 7. 测试快捷查询点击
    console.log('\n🖱️  快捷查询点击测试:');
    console.log('-'.repeat(60));
    const quickQueryBtn = await page.$('.sidebar-item[click]');
    if (quickQueryBtn) {
      console.log('✅ 找到可点击的快捷查询项');
      const btnText = await page.evaluate(el => el.textContent.trim(), quickQueryBtn);
      console.log(`   点击: "${btnText}"`);
      await quickQueryBtn.click();
      await sleep(500);

      // 检查是否填充到输入框
      const inputAfterClick = await page.$('.message-input, textarea');
      if (inputAfterClick) {
        const inputValue = await page.evaluate(el => el.value, inputAfterClick);
        if (inputValue) {
          console.log(`✅ 点击成功，输入框已填充: "${inputValue}"`);
        } else {
          console.log('⚠️  点击后输入框未填充');
        }
      }
    } else {
      console.log('⚠️  未找到可点击的快捷查询项');
    }

    // 8. 测试发送消息
    console.log('\n📤 发送消息测试:');
    console.log('-'.repeat(60));
    const sendButton = await page.$('.send-btn');
    const inputBox = await page.$('.message-input, textarea');

    if (sendButton && inputBox) {
      const canSend = await page.evaluate(
        (btn, input) => !btn.disabled && input.value.trim().length > 0,
        sendButton,
        inputBox
      );

      if (canSend) {
        console.log('✅ 发送按钮可用，准备发送消息...');
        await sendButton.click();
        await sleep(2000);

        // 检查是否有loading状态或响应
        const hasResponse = await page.evaluate(() => {
          const loading = document.querySelector('.loading, .sending, [class*="loading"]');
          const messages = document.querySelectorAll('.message, .chat-message');
          return { loading: !!loading, messageCount: messages.length };
        });

        console.log(`   响应状态: ${hasResponse.loading ? '处理中' : '完成'}`);
        console.log(`   消息数量: ${hasResponse.messageCount}`);
      } else {
        console.log('⚠️  发送按钮不可用或输入框为空');
      }
    } else {
      console.log('❌ 无法找到发送按钮或输入框');
    }

    // 9. 检查控制台错误
    console.log('\n🚨 控制台错误检查:');
    console.log('-'.repeat(60));
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await sleep(1000);

    if (errors.length > 0) {
      console.log(`⚠️  发现 ${errors.length} 个控制台错误:`);
      errors.slice(0, 5).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.substring(0, 100)}...`);
      });
    } else {
      console.log('✅ 无控制台错误');
    }

    // 10. 截图保存
    console.log('\n📸 截图保存:');
    console.log('-'.repeat(60));
    const screenshotPath = '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-page-test.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ 截图已保存: ${screenshotPath}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 浏览器测试完成！');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();

// 模拟登录函数
async function loginAsAdmin(page) {
  console.log('   尝试模拟登录...');

  // 查找管理员快速登录按钮
  const adminButtons = await page.$$('button, .el-button, [role="button"]');
  for (const btn of adminButtons) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text.includes('系统管理员') || text.includes('admin')) {
      console.log(`   点击登录按钮: "${text}"`);
      await btn.click();
      await sleep(2000);

      // 检查是否登录成功
      const newUrl = page.url();
      if (!newUrl.includes('/login')) {
        console.log('✅ 登录成功!');
        return;
      }
    }
  }

  // 如果没找到按钮，等待用户登录
  console.log('   未找到快速登录按钮，请手动登录...');
  await sleep(5000);
}
