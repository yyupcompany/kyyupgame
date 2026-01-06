const { chromium } = require('playwright');

async function comprehensiveMCPTest() {
  console.log('🚀 开始全面MCP浏览器系统验证...');
  
  const browser = await chromium.launch({ 
    headless: false,  // 显示浏览器便于观察
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  // 监听网络请求
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // 监听响应
  const responses = [];
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      responses.push({
        url: response.url(),
        status: response.status(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  try {
    console.log('\n=== 第一阶段：基础系统验证 ===');
    
    console.log('🌐 访问系统首页...');
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    const url = page.url();
    console.log('📄 页面标题:', title);
    console.log('🌐 当前URL:', url);
    
    // 检查登录表单
    const hasLoginForm = await page.locator('form').count() > 0;
    const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
    
    if (hasLoginForm && hasPasswordInput) {
      console.log('\n=== 第二阶段：登录功能测试 ===');
      
      // 尝试多个可能的测试账号
      const testAccounts = [
        { username: 'admin', password: 'admin123' },
        { username: 'admin', password: '123456' },
        { username: 'test', password: 'test123' },
        { username: 'demo', password: 'demo123' }
      ];
      
      let loginSuccess = false;
      
      for (const account of testAccounts) {
        console.log(`\n🔐 尝试登录: ${account.username} / ${account.password}`);
        
        // 清空输入框
        await page.locator('input[type="text"], input:not([type="password"])').first().fill('');
        await page.locator('input[type="password"]').first().fill('');
        
        // 填写账号信息
        await page.locator('input[type="text"], input:not([type="password"])').first().fill(account.username);
        await page.locator('input[type="password"]').first().fill(account.password);
        
        await page.waitForTimeout(1000);
        
        // 点击登录
        await page.locator('button[type="submit"], button:has-text("登录")').first().click();
        
        // 等待响应
        await page.waitForTimeout(5000);
        
        const newUrl = page.url();
        const bodyText = await page.textContent('body').catch(() => '');
        
        // 检查是否登录成功
        if (newUrl !== url && !newUrl.includes('/login')) {
          console.log('✅ 登录成功！跳转到:', newUrl);
          loginSuccess = true;
          break;
        } else if (bodyText.includes('欢迎') || bodyText.includes('dashboard')) {
          console.log('✅ 登录成功！页面内容已更新');
          loginSuccess = true;
          break;
        } else {
          console.log('❌ 登录失败，继续尝试下一个账号');
        }
      }
      
      if (loginSuccess) {
        console.log('\n=== 第三阶段：登录后功能验证 ===');
        
        // 等待页面完全加载
        await page.waitForTimeout(3000);
        
        // 检查主要功能模块
        const modules = [
          { name: 'AI助手', selectors: ['button:has-text("AI")', '[title*="AI"]', '.ai-assistant'] },
          { name: '用户管理', selectors: ['a:has-text("用户")', '[href*="user"]', '.user-menu'] },
          { name: '学生管理', selectors: ['a:has-text("学生")', '[href*="student"]', '.student-menu'] },
          { name: '活动管理', selectors: ['a:has-text("活动")', '[href*="activity"]', '.activity-menu'] },
          { name: '招生管理', selectors: ['a:has-text("招生")', '[href*="enrollment"]', '.enrollment-menu'] }
        ];
        
        console.log('🔍 检查功能模块:');
        for (const module of modules) {
          let found = false;
          for (const selector of module.selectors) {
            const count = await page.locator(selector).count();
            if (count > 0) {
              console.log(`  ✅ ${module.name}: 找到${count}个元素`);
              found = true;
              break;
            }
          }
          if (!found) {
            console.log(`  ❌ ${module.name}: 未找到`);
          }
        }
        
        // 测试AI助手功能
        console.log('\n=== 第四阶段：AI助手功能测试 ===');
        
        const aiSelectors = [
          'button:has-text("AI")',
          'button:has-text("YY-AI")',
          '[title*="AI"]',
          '.ai-assistant-toggle',
          '.ai-button'
        ];
        
        let aiButton = null;
        for (const selector of aiSelectors) {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            aiButton = element;
            console.log(`🤖 找到AI助手按钮: ${selector}`);
            break;
          }
        }
        
        if (aiButton) {
          console.log('🔘 点击AI助手按钮...');
          await aiButton.click();
          await page.waitForTimeout(3000);
          
          // 检查AI助手界面
          const aiInterface = await page.locator('.ai-assistant, .ai-chat, .assistant-panel').count();
          if (aiInterface > 0) {
            console.log('✅ AI助手界面已打开');
            
            // 尝试发送测试消息
            const messageInput = page.locator('textarea, input[placeholder*="消息"], input[placeholder*="问题"]').first();
            if (await messageInput.isVisible()) {
              console.log('📝 发送测试消息...');
              await messageInput.fill('你好，请介绍一下这个系统的功能');
              
              const sendButton = page.locator('button:has-text("发送"), button[type="submit"]').first();
              if (await sendButton.isVisible()) {
                await sendButton.click();
                await page.waitForTimeout(5000);
                console.log('✅ 测试消息已发送');
              }
            }
          } else {
            console.log('❌ AI助手界面未正确打开');
          }
        } else {
          console.log('⚠️ 未找到AI助手按钮');
        }
        
        // 测试导航功能
        console.log('\n=== 第五阶段：导航功能测试 ===');
        
        const navLinks = await page.locator('a[href], .menu-item, .nav-item').all();
        console.log(`🔍 找到${navLinks.length}个导航链接`);
        
        if (navLinks.length > 0) {
          // 测试前3个导航链接
          for (let i = 0; i < Math.min(3, navLinks.length); i++) {
            try {
              const link = navLinks[i];
              const text = await link.textContent() || '';
              const href = await link.getAttribute('href') || '';
              
              if (text.trim() && !href.includes('javascript:') && !href.includes('#')) {
                console.log(`🔗 测试导航: ${text.trim()}`);
                await link.click();
                await page.waitForTimeout(2000);
                
                const currentUrl = page.url();
                console.log(`  ➜ 跳转到: ${currentUrl}`);
              }
            } catch (e) {
              console.log(`  ⚠️ 导航测试跳过: ${e.message}`);
            }
          }
        }
        
      } else {
        console.log('\n⚠️ 所有测试账号登录失败');
        console.log('可能需要在数据库中创建测试用户');
      }
    }
    
    // 网络请求分析
    console.log('\n=== 第六阶段：网络请求分析 ===');
    console.log(`📊 API请求总数: ${requests.length}`);
    console.log(`📊 API响应总数: ${responses.length}`);
    
    if (requests.length > 0) {
      console.log('\n🌐 API请求详情:');
      requests.slice(0, 5).forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url}`);
      });
    }
    
    if (responses.length > 0) {
      console.log('\n📡 API响应状态:');
      const statusCounts = {};
      responses.forEach(res => {
        statusCounts[res.status] = (statusCounts[res.status] || 0) + 1;
      });
      
      Object.entries(statusCounts).forEach(([status, count]) => {
        const icon = status.startsWith('2') ? '✅' : status.startsWith('4') ? '⚠️' : '❌';
        console.log(`  ${icon} ${status}: ${count}次`);
      });
    }
    
    // 最终系统评估
    console.log('\n=== 系统综合评估 ===');
    
    const assessment = {
      frontend: '✅ 正常',
      backend: responses.some(r => r.status < 400) ? '✅ 正常' : '⚠️ 需检查',
      login: loginSuccess ? '✅ 正常' : '⚠️ 需配置',
      ai: aiButton ? '✅ 可用' : '⚠️ 需检查',
      navigation: navLinks.length > 0 ? '✅ 正常' : '⚠️ 需检查'
    };
    
    console.log('📋 系统状态总结:');
    Object.entries(assessment).forEach(([component, status]) => {
      console.log(`  - ${component}: ${status}`);
    });
    
    const overallHealth = Object.values(assessment).filter(s => s.includes('✅')).length;
    const totalComponents = Object.keys(assessment).length;
    const healthPercentage = Math.round((overallHealth / totalComponents) * 100);
    
    console.log(`\n🎯 系统健康度: ${healthPercentage}% (${overallHealth}/${totalComponents})`);
    
    if (healthPercentage >= 80) {
      console.log('🎉 系统状态优秀！');
    } else if (healthPercentage >= 60) {
      console.log('👍 系统状态良好，有小问题需要处理');
    } else {
      console.log('⚠️ 系统需要进一步调试和优化');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
  } finally {
    console.log('\n⏳ 10秒后关闭浏览器...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('✅ 全面MCP浏览器验证完成！');
  }
}

comprehensiveMCPTest().catch(console.error);
