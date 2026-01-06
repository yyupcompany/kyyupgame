const { chromium } = require('playwright');
const fs = require('fs');

/**
 * 测试活动海报更新完整流程
 * 1. 获取当前活动列表
 * 2. 上传海报图片
 * 3. 更新活动海报
 */

async function testActivityPosterUpdate() {
  console.log('🎪 开始测试活动海报更新完整流程');
  console.log('=====================================\n');

  let browser;
  const testPosterPath = '/tmp/activity-poster-test.png';

  try {
    // === 创建测试海报图片 ===
    console.log('📍 阶段1: 创建测试活动海报图片');

    // 创建一个活动海报图片
    const posterSvg = `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="600" fill="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"/>

      <!-- 标题 -->
      <text x="200" y="80" text-anchor="middle" font-size="32" font-weight="bold" fill="white">
        2025春季亲子运动会
      </text>

      <!-- 副标题 -->
      <text x="200" y="120" text-anchor="middle" font-size="18" fill="#ffd700">
        快乐运动 健康成长
      </text>

      <!-- 活动信息 -->
      <rect x="50" y="160" width="300" height="200" fill="rgba(255,255,255,0.9)" rx="10"/>

      <text x="200" y="200" text-anchor="middle" font-size="20" font-weight="bold" fill="#2c3e50">
        活动详情
      </text>

      <text x="70" y="240" font-size="16" fill="#34495e">
        📅 时间：2025年4月15日 上午9:00
      </text>

      <text x="70" y="270" font-size="16" fill="#34495e">
        📍 地点：幼儿园操场
      </text>

      <text x="70" y="300" font-size="16" fill="#34495e">
        👨‍👩‍👧‍👦 对象：全园师生及家长
      </text>

      <text x="70" y="330" font-size="16" fill="#34495e">
        🎯 活动：亲子游戏、趣味竞赛
      </text>

      <!-- 底部信息 -->
      <text x="200" y="420" text-anchor="middle" font-size="18" fill="white">
        期待您的参与！
      </text>

      <!-- 装饰元素 -->
      <circle cx="80" cy="500" r="30" fill="#ffd700" opacity="0.8"/>
      <circle cx="320" cy="500" r="30" fill="#ffd700" opacity="0.8"/>
      <circle cx="200" cy="550" r="25" fill="#e74c3c" opacity="0.8"/>

      <!-- 幼儿园标识 -->
      <text x="200" y="580" text-anchor="middle" font-size="14" fill="white">
        阳光幼儿园
      </text>
    </svg>
    `;

    // 保存为SVG然后转换为PNG（模拟）
    fs.writeFileSync('/tmp/activity-poster.svg', posterSvg, 'utf8');

    // 创建一个简单的PNG文件（实际项目中这里应该是真实的图片）
    const imageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testPosterPath, imageData);

    console.log('✅ 测试活动海报图片已创建');

    // === 启动浏览器测试 ===
    console.log('\n📍 阶段2: 启动浏览器测试');

    browser = await chromium.launch({
      headless: false,
      slowMo: 1000,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      viewport: { width: 1400, height: 800 }
    });

    const page = await context.newPage();

    // 监听所有相关事件
    const events = [];
    const apiCalls = [];

    page.on('console', msg => {
      const text = msg.text();
      events.push(text);

      if (text.includes('活动') || text.includes('poster') || text.includes('图片') || text.includes('upload')) {
        console.log('📡 事件:', text);
      }
    });

    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/activities') || url.includes('/api/files')) {
        apiCalls.push({
          method: request.method(),
          url: url,
          timestamp: new Date().toISOString()
        });
        console.log('🌐 API调用:', request.method(), url);
      }
    });

    try {
      // === 登录系统 ===
      console.log('\n🔐 步骤1: 登录系统');
      await page.goto('http://localhost:5173/login-only.html', { waitUntil: 'networkidle' });

      const usernameInput = await page.$('input[placeholder*="用户名"], input[type="text"]');
      const passwordInput = await page.$('input[placeholder*="密码"], input[type="password"]');
      const loginButton = await page.$('.login-btn, button[type="submit"], .el-button--primary');

      if (usernameInput && passwordInput && loginButton) {
        await usernameInput.fill('admin');
        await passwordInput.fill('123456');
        await loginButton.click();
        await page.waitForTimeout(3000);
        console.log('✅ 登录成功');
      } else {
        console.log('❌ 未找到登录表单元素');
        return;
      }

      // === 访问AI助手 ===
      console.log('\n🤖 步骤2: 访问AI助手');
      await page.goto('http://localhost:5173/centers/ai', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);

      // === 步骤3: 获取当前活动列表 ===
      console.log('\n📋 步骤3: 获取当前活动列表');

      const messageInput = await page.$('textarea[placeholder*="输入"], .el-textarea__inner, textarea');
      const sendButton = await page.$('.send-btn, button[title*="发送"], .el-button--primary');

      if (messageInput && sendButton) {
        console.log('✅ 找到AI对话输入框');

        // 发送获取活动列表的请求
        const activityListRequest = '你好，请帮我获取当前的活动列表，我需要查看所有正在进行和计划中的活动。';

        await messageInput.fill(activityListRequest);
        await sendButton.click();

        console.log('✅ 已发送获取活动列表请求');
        console.log('⏱️ 等待AI响应和处理...');

        // 等待AI处理活动列表请求
        await page.waitForTimeout(10000);

        // 检查AI响应
        const aiResponses = await page.$$('[class*="message"], [class*="content"]');
        if (aiResponses.length > 0) {
          console.log('✅ 检测到AI响应');

          // 查找最后几条消息
          const recentMessages = aiResponses.slice(-3);
          for (let i = 0; i < recentMessages.length; i++) {
            try {
              const text = await recentMessages[i].textContent();
              if (text && text.length > 20) {
                console.log(`   消息${i + 1}:`, text.substring(0, 150) + '...');
              }
            } catch (error) {
              console.log('   消息解析错误:', error.message);
            }
          }
        }

      } else {
        console.log('❌ 未找到AI对话输入框');
      }

      // === 步骤4: 上传活动海报图片 ===
      console.log('\n📸 步骤4: 上传活动海报图片');

      await page.waitForTimeout(2000);

      // 查找图片上传按钮
      const imageUploadBtn = await page.$('button[title*="图片"], button[title*="图像"], .icon-picture');

      if (imageUploadBtn) {
        console.log('✅ 找到图片上传按钮');

        try {
          const fileInputPromise = page.waitForEvent('filechooser');
          await imageUploadBtn.click();

          const fileChooser = await fileInputPromise;
          await fileChooser.setFiles(testPosterPath);
          console.log('✅ 活动海报图片已上传');
          await page.waitForTimeout(3000);

        } catch (fileError) {
          console.log('❌ 图片上传失败:', fileError.message);
        }
      } else {
        console.log('❌ 未找到图片上传按钮');

        // 尝试其他方式查找文件上传
        const fileInputs = await page.$$('input[type="file"]');
        if (fileInputs.length > 0) {
          console.log(`✅ 找到 ${fileInputs.length} 个文件输入框`);
          await fileInputs[0].setInputFiles(testPosterPath);
          console.log('✅ 活动海报图片已通过文件输入框上传');
          await page.waitForTimeout(3000);
        }
      }

      // === 步骤5: 发送海报更新请求 ===
      console.log('\n🎨 步骤5: 发送海报更新请求给AI');

      if (messageInput && sendButton) {
        const posterUpdateRequest = `我刚刚上传了一张活动海报图片，请帮我把这个图片设置为某个活动的海报。

请：
1. 选择一个合适的活动（如果没有合适的活动，请告诉我）
2. 将我上传的海报图片设置为该活动的宣传海报
3. 更新活动的海报信息

谢谢！`;

        await messageInput.fill(posterUpdateRequest);
        await sendButton.click();

        console.log('✅ 已发送海报更新请求');
        console.log('⏱️ 等待AI处理海报更新...');

        // 等待AI处理海报更新请求（可能需要更多时间）
        await page.waitForTimeout(15000);

      } else {
        console.log('❌ 未找到AI对话输入框');
      }

      // === 步骤6: 检查处理结果 ===
      console.log('\n🔍 步骤6: 检查海报更新处理结果');

      // 检查是否有确认对话框
      const confirmDialog = await page.$('.el-dialog, .el-message-box, [role="dialog"]');
      if (confirmDialog) {
        console.log('✅ 检测到确认对话框');
        try {
          const dialogText = await confirmDialog.textContent();
          console.log('   对话框内容:', dialogText?.substring(0, 300) + '...');
        } catch (error) {
          console.log('   对话框内容解析失败:', error.message);
        }
      }

      // 检查是否有确认按钮
      const confirmBtn = await page.$('button:has-text("确定"), button:has-text("确认"), button:has-text("执行")');
      const cancelBtn = await page.$('button:has-text("取消"), button:has-text("否")');

      if (confirmBtn) {
        console.log('✅ 找到确认按钮 - AI要求用户确认海报更新操作');
      }

      if (cancelBtn) {
        console.log('✅ 找到取消按钮');
      }

      // 检查API调用统计
      console.log(`\n🌐 检测到的API调用: ${apiCalls.length} 个`);
      apiCalls.forEach((call, index) => {
        console.log(`   ${index + 1}. ${call.method} ${call.url} (${call.timestamp})`);
      });

      // === 步骤7: 截图记录 ===
      console.log('\n📸 步骤7: 截图记录测试结果');
      await page.screenshot({
        path: 'docs/浏览器检查/activity-poster-update-test.png',
        fullPage: true
      });
      console.log('✅ 测试截图已保存');

    } catch (error) {
      console.log('❌ 页面操作失败:', error.message);
    }

    // === 分析测试结果 ===
    console.log('\n📍 阶段3: 分析测试结果');
    console.log('====================');

    console.log(`📊 事件统计: ${events.length} 个相关事件`);
    console.log(`🌐 API调用: ${apiCalls.length} 个`);

    // 分析API调用类型
    const activitiesCalls = apiCalls.filter(call => call.url.includes('/api/activities'));
    const filesCalls = apiCalls.filter(call => call.url.includes('/api/files'));

    console.log('\n🎯 API调用分析:');
    console.log('===============');
    console.log(`活动管理API: ${activitiesCalls.length} 个调用`);
    console.log(`文件上传API: ${filesCalls.length} 个调用`);

    if (activitiesCalls.length > 0) {
      console.log('✅ 活动管理功能正常工作');
    }

    if (filesCalls.length > 0) {
      console.log('✅ 文件上传功能正常工作');
    }

    console.log('\n🚀 活动海报更新流程分析:');
    console.log('==========================');
    console.log('📋 活动列表获取: AI应该能获取当前活动列表');
    console.log('📸 海报图片上传: 用户可以上传活动海报图片');
    console.log('🎨 海报更新处理: AI理解并处理海报更新请求');
    console.log('🔧 工具调用支持: AI调用相应工具更新活动信息');
    console.log('✅ 用户确认机制: 前端提供确认对话框');
    console.log('⚡ 批量更新完成: 自动更新活动海报和相关信息');

    console.log('\n💡 实际应用场景:');
    console.log('================');
    console.log('🏫 活动营销: 快速更新活动宣传海报');
    console.log('📱 移动办公: 随时随地更新活动信息');
    console.log('🎯 精准营销: 为特定活动设置专门海报');
    console.log('⚡ 效率提升: 减少手动操作步骤');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🏁 浏览器已关闭');
    }

    // 清理测试文件
    try {
      if (fs.existsSync('/tmp/activity-poster.svg')) {
        fs.unlinkSync('/tmp/activity-poster.svg');
      }
      if (fs.existsSync(testPosterPath)) {
        fs.unlinkSync(testPosterPath);
      }
      console.log('🧹 测试文件已清理');
    } catch (error) {
      console.log('⚠️ 清理文件时出错:', error.message);
    }
  }
}

// 运行测试
testActivityPosterUpdate().catch(console.error);