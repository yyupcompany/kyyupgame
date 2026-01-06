/**
 * 浏览器自动化测试 - AI助手页面完整功能测试（带登录）
 * 测试流程：
 * 1. 访问首页
 * 2. 等待页面加载并自动登录
 * 3. 导航到AI助手页面
 * 4. 检查页面元素和功能
 */

const puppeteer = require('puppeteer');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('🚀 启动浏览器测试 AI助手页面（带自动登录）');
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
      await performMockLogin(page);
      await sleep(3000);
    } else {
      console.log('   页面已登录，跳过登录步骤');
    }

    console.log('\n📍 步骤 3: 导航到AI助手页面');
    await page.goto('http://localhost:5173/aiassistant', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);

    // 等待Vue组件渲染
    await page.waitForSelector('.ai-assistant-container, [data-testid="ai-assistant-wrapper"], .ai-assistant-top-bar', {
      timeout: 10000
    }).catch(() => {
      console.log('   等待组件渲染超时，继续测试...');
    });

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
      console.log('⚠️  AI助手容器未找到，尝试查找其他选择器...');

      // 尝试查找Vue组件
      const vueComponent = await page.$('#app > *');
      if (vueComponent) {
        const componentHTML = await page.evaluate(el => el.innerHTML.substring(0, 200), vueComponent);
        console.log('   页面内容预览:', componentHTML);
      }
    }

    // 3. 检查顶部导航栏
    console.log('\n🎨 顶部导航栏检查:');
    console.log('-'.repeat(60));
    const topBar = await page.$('.ai-assistant-top-bar, .top-bar-left, .top-bar-right');
    if (topBar) {
      console.log('✅ 顶部导航栏存在');

      // 检查AI头像
      const avatar = await page.$('.ai-avatar, .top-bar-left .ai-avatar, [class*="avatar"]');
      if (avatar) {
        console.log('✅ AI头像存在');
      } else {
        console.log('⚠️  AI头像未找到');
      }

      // 检查在线状态
      const status = await page.$('.ai-status, .status-indicator, .status-text');
      if (status) {
        console.log('✅ 在线状态显示正常');
      } else {
        console.log('⚠️  在线状态未找到');
      }

      // 检查功能按钮
      const buttons = await page.$$eval('.icon-btn, button[class*="icon"]', buttons =>
        buttons.slice(0, 10).map(btn => ({
          title: btn.title || btn.getAttribute('title') || '',
          className: btn.className
        }))
      );
      console.log(`✅ 功能按钮数量: ${buttons.length}`);
      buttons.forEach((btn, index) => {
        console.log(`   ${index + 1}. [${btn.title || '无标题'}] - ${btn.className}`);
      });
    } else {
      console.log('❌ 顶部导航栏未找到');

      // 查找任何按钮元素
      const anyButtons = await page.$$('button, .el-button, [role="button"]');
      console.log(`   页面中找到 ${anyButtons.length} 个按钮元素`);
    }

    // 4. 检查侧边栏
    console.log('\n📋 侧边栏检查:');
    console.log('-'.repeat(60));
    const sidebar = await page.$('.ai-sidebar, [class*="sidebar"]');
    if (sidebar) {
      console.log('✅ 侧边栏存在');

      // 检查侧边栏sections
      const sections = await page.$$eval('.sidebar-section, [class*="section"]', sections =>
        sections.slice(0, 10).map(section => ({
          title: section.querySelector('.sidebar-title, [class*="title"]')?.textContent?.trim() || ''
        }))
      );
      console.log(`✅ 侧边栏分区数量: ${sections.length}`);
      sections.forEach((section, index) => {
        console.log(`   ${index + 1}. ${section.title}`);
      });

      // 检查快捷查询按钮
      const quickQueryItems = await page.$$eval('.sidebar-item, [class*="item"]', items =>
        items.filter(item => item.onclick || item.style.cursor === 'pointer').map(item =>
          item.textContent?.trim()
        )
      );
      console.log(`✅ 可点击项目数量: ${quickQueryItems.length}`);
    } else {
      console.log('❌ 侧边栏未找到');
    }

    // 5. 检查聊天区域
    console.log('\n💬 聊天区域检查:');
    console.log('-'.repeat(60));
    const chatContainer = await page.$('.chat-container, [class*="chat"]');
    if (chatContainer) {
      console.log('✅ 聊天容器存在');

      // 检查欢迎消息
      const welcomeMsg = await page.$('.welcome-message, [class*="welcome"]');
      if (welcomeMsg) {
        console.log('✅ 欢迎消息显示正常');
        const welcomeTitle = await page.$eval('.welcome-title, [class*="title"]', el => el.textContent).catch(() => '未找到');
        console.log(`   标题: ${welcomeTitle}`);
      } else {
        console.log('⚠️  欢迎消息未找到（可能已有对话）');
      }

      // 检查输入框
      const input = await page.$('.message-input, textarea, input[type="text"], .el-textarea__inner');
      if (input) {
        console.log('✅ 输入框存在');

        // 尝试输入测试文本
        await input.click();
        await input.type('测试AI助手功能', { delay: 30 });
        const inputValue = await page.evaluate(el => el.value, input);
        console.log(`✅ 输入测试成功: "${inputValue}"`);
      } else {
        console.log('❌ 输入框未找到');
      }

      // 检查发送按钮
      const sendBtn = await page.$('.send-btn, button[class*="send"], [title*="发送"]');
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
      const iconNodes = document.querySelectorAll('.unified-icon, svg[class*="icon"], [class*="icon"] svg');
      return Array.from(iconNodes).slice(0, 20).map(icon => {
        const name = icon.getAttribute('name') || icon.getAttribute('class') || 'unknown';
        const hasSVG = icon.querySelector('path') !== null || icon.tagName === 'svg';
        return { name, hasSVG, tagName: icon.tagName };
      });
    });

    if (icons.length === 0) {
      console.log('⚠️  未找到图标元素');
    } else {
      console.log(`✅ 找到 ${icons.length} 个图标元素:`);
      icons.forEach((icon, index) => {
        const status = icon.hasSVG ? '✅' : '⚠️';
        console.log(`   ${index + 1}. ${status} ${icon.name} (${icon.tagName})`);
      });
    }

    // 7. 测试快捷查询点击
    console.log('\n🖱️  快捷查询点击测试:');
    console.log('-'.repeat(60));
    const quickQueryBtn = await page.$('.sidebar-item, [class*="item"]');
    if (quickQueryBtn) {
      console.log('✅ 找到可点击的侧边栏项目');
      const btnText = await page.evaluate(el => el.textContent.trim(), quickQueryBtn);
      console.log(`   准备点击: "${btnText}"`);
      await quickQueryBtn.click();
      await sleep(1000);

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
      console.log('⚠️  未找到可点击的侧边栏项目');
    }

    // 8. 测试发送消息
    console.log('\n📤 发送消息测试:');
    console.log('-'.repeat(60));
    const sendButton = await page.$('.send-btn, button[class*="send"]');
    const inputBox = await page.$('.message-input, textarea');

    if (sendButton && inputBox) {
      // 确保输入框有内容
      const inputValue = await page.evaluate(el => el.value, inputBox);
      if (!inputValue.trim()) {
        await inputBox.type('你好，AI助手！', { delay: 30 });
      }

      const canSend = await page.evaluate(
        (btn, input) => !btn.disabled && input.value.trim().length > 0,
        sendButton,
        inputBox
      );

      if (canSend) {
        console.log('✅ 发送按钮可用，准备发送消息...');
        await sendButton.click();
        console.log('   点击发送按钮成功');
        await sleep(3000);

        // 检查是否有响应
        const hasResponse = await page.evaluate(() => {
          const loading = document.querySelector('.loading, .sending, [class*="loading"], [class*="sending"]');
          const messages = document.querySelectorAll('.message, .chat-message, [class*="message"], [class*="chat"]');
          return { loading: !!loading, messageCount: messages.length };
        });

        console.log(`   响应状态: ${hasResponse.loading ? '处理中' : '完成'}`);
        console.log(`   检测到消息元素: ${hasResponse.messageCount} 个`);
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
    await sleep(2000);

    if (errors.length > 0) {
      console.log(`⚠️  发现 ${errors.length} 个控制台错误:`);
      errors.slice(0, 5).forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.substring(0, 150)}`);
      });
    } else {
      console.log('✅ 无控制台错误');
    }

    // 10. 页面内容快照
    console.log('\n📄 页面内容快照:');
    console.log('-'.repeat(60));
    const pageContent = await page.evaluate(() => {
      const container = document.querySelector('.ai-assistant-container') || document.body;
      return {
        hasAIAssistant: !!document.querySelector('.ai-assistant-container'),
        title: document.title,
        url: window.location.href,
        bodyText: container.innerText.substring(0, 200)
      };
    });
    console.log('   AI助手容器:', pageContent.hasAIAssistant ? '✅ 存在' : '❌ 不存在');
    console.log('   当前URL:', pageContent.url);
    console.log('   页面内容预览:', pageContent.bodyText);

    // 11. 截图保存
    console.log('\n📸 截图保存:');
    console.log('-'.repeat(60));
    const screenshotPath = '/home/zhgue/kyyupgame/k.yyup.com/aiassistant-full-test.png';
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

// 执行模拟登录
async function performMockLogin(page) {
  console.log('   开始模拟登录流程...');

  // 等待登录页面加载
  await sleep(2000);

  // 查找并点击管理员登录按钮
  const adminButtons = await page.$$('button, .el-button, [role="button"]');
  console.log(`   找到 ${adminButtons.length} 个按钮`);

  for (const btn of adminButtons) {
    const text = await page.evaluate(el => el.textContent.trim(), btn);
    if (text && (text.includes('系统管理员') || text.includes('admin') || text.includes('管理员'))) {
      console.log(`   ✅ 找到并点击管理员按钮: "${text}"`);
      await btn.click();
      await sleep(3000);

      // 检查是否登录成功
      const newUrl = page.url();
      console.log(`   登录后URL: ${newUrl}`);

      if (!newUrl.includes('/login')) {
        console.log('✅ 模拟登录成功！');
        return true;
      }
    }
  }

  console.log('   ⚠️  未找到管理员登录按钮，尝试手动等待...');
  await sleep(5000);

  const finalUrl = page.url();
  if (!finalUrl.includes('/login')) {
    console.log('✅ 登录成功（通过等待）！');
    return true;
  } else {
    console.log('❌ 登录失败');
    return false;
  }
}
