const { chromium } = require('playwright');
const fs = require('fs');

/**
 * 真实的AI助手活动海报更新测试
 * 使用浏览器手动操作来验证完整工作流程
 */

async function testRealAIPosterWorkflow() {
  console.log('🎪 真实的AI助手活动海报更新测试');
  console.log('=======================================\n');

  let browser;

  try {
    // === 创建测试海报图片 ===
    console.log('📍 步骤1: 创建测试海报图片');

    // 创建一个SVG海报图片
    const posterSvg = `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
        </linearGradient>
      </defs>

      <!-- 背景 -->
      <rect width="400" height="600" fill="url(#bg)"/>

      <!-- 标题区域 -->
      <rect x="20" y="20" width="360" height="100" fill="rgba(255,255,255,0.95)" rx="10"/>
      <text x="200" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#2C3E50">
        2025春季亲子运动会
      </text>
      <text x="200" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#5A6C7D">
        快乐运动 健康成长
      </text>

      <!-- 活动信息 -->
      <rect x="20" y="140" width="360" height="200" fill="rgba(255,255,255,0.95)" rx="10"/>
      <text x="200" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#2C3E50">
        活动详情
      </text>

      <text x="40" y="200" font-family="Arial, sans-serif" font-size="14" fill="#34495E">
        📅 时间：2025年4月15日 上午9:00
      </text>
      <text x="40" y="225" font-family="Arial, sans-serif" font-size="14" fill="#34495E">
        📍 地点：幼儿园操场
      </text>
      <text x="40" y="250" font-family="Arial, sans-serif" font-size="14" fill="#34495E">
        👨‍👩‍👧‍👦 对象：全园师生及家长
      </text>
      <text x="40" y="275" font-family="Arial, sans-serif" font-size="14" fill="#34495E">
        🎯 活动：亲子游戏、趣味竞赛、表演展示
      </text>
      <text x="40" y="300" font-family="Arial, sans-serif" font-size="14" fill="#34495E">
        🎁 奖品：精美小礼品和参与证书
      </text>

      <!-- 联系信息 -->
      <rect x="20" y="360" width="360" height="80" fill="rgba(255,255,255,0.95)" rx="10"/>
      <text x="200" y="385" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#2C3E50">
        联系我们
      </text>
      <text x="40" y="410" font-family="Arial, sans-serif" font-size="14" fill="#34495E">
        📞 电话：020-12345678
      </text>
      <text x="40" y="430" font-family="Arial, sans-serif" font-size="14" fill="#34495E">
        🏫 地址：阳光幼儿园操场
      </text>

      <!-- 底部装饰 -->
      <circle cx="80" cy="520" r="25" fill="#FCD34D" opacity="0.8"/>
      <circle cx="200" cy="550" r="30" fill="#4CAF50" opacity="0.8"/>
      <circle cx="320" cy="520" r="25" fill="#FF5722" opacity="0.8"/>

      <!-- 幼儿园名称 -->
      <text x="200" y="580" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">
        阳光幼儿园
      </text>
    </svg>
    `;

    // 保存SVG文件
    const svgPath = '/tmp/activity-poster.svg';
    fs.writeFileSync(svgPath, posterSvg, 'utf8');

    // 使用Node.js的child_process来转换SVG为PNG
    const { execSync } = require('child_process');
    try {
      // 尝试使用inkscape转换
      execSync(`inkscape -z -w 400 -h 600 ${svgPath} /tmp/activity-poster.png`, { stdio: 'ignore' });
      console.log('✅ 使用inkscape转换SVG为PNG成功');
    } catch (error) {
      try {
        // 尝试使用convert
        execSync(`convert ${svgPath} /tmp/activity-poster.png`, { stdio: 'ignore' });
        console.log('✅ 使用convert转换SVG为PNG成功');
      } catch (convertError) {
        // 如果转换失败，创建一个简单的PNG文件
        console.log('⚠️ 无法转换SVG，创建简单PNG文件');
        const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        fs.writeFileSync('/tmp/activity-poster.png', Buffer.from(base64Png, 'base64'));
      }
    }

    console.log('✅ 测试海报图片已创建');

    // === 启动浏览器 ===
    console.log('\n📍 步骤2: 启动浏览器');

    browser = await chromium.launch({
      headless: false,
      slowMo: 1000,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const context = await browser.newContext({
      viewport: { width: 1400, height: 800 }
    });

    const page = await context.newPage();

    console.log('✅ 浏览器已启动');
    console.log('📝 请按照以下步骤进行手动测试：');
    console.log('=====================================');

    console.log('\n🔐 步骤1: 登录系统');
    console.log('   1. 打开浏览器访问: http://localhost:5173/login-only.html');
    console.log('   2. 用户名: admin');
    console.log('   3. 密码: 123456');
    console.log('   4. 点击登录按钮');

    console.log('\n🤖 步骤2: 访问AI助手');
    console.log('   1. 登录成功后，在地址栏输入: http://localhost:5173/ai/assistant');
    console.log('   2. 等待AI助手页面加载完成');

    console.log('\n📋 步骤3: 测试活动列表查询');
    console.log('   1. 在AI助手的输入框中输入: "请帮我获取当前的活动列表"');
    console.log('   2. 点击发送按钮或按Enter');
    console.log('   3. 观察AI的响应和返回的活动列表');

    console.log('\n📸 步骤4: 上传海报图片');
    console.log('   1. 点击输入框上方的图片上传按钮（通常是一个图片图标）');
    console.log('   2. 选择文件：/tmp/activity-poster.png');
    console.log('   3. 等待图片上传完成');

    console.log('\n🎨 步骤5: 测试海报更新请求');
    console.log('   1. 在输入框中输入: "请把我刚才上传的图片设置为某个活动的海报"');
    console.log('   2. 描述你的具体需求，例如：');
    console.log('      - "请将这个海报设置为春季运动会的海报"');
    console.log('      - "更新活动ID为1的海报"');
    console.log('      - "将海报应用到合适的活动上"');
    console.log('   3. 点击发送按钮');

    console.log('\n✅ 步骤6: 观察和处理结果');
    console.log('   1. 仔细观察AI的响应内容');
    console.log('   2. 注意是否有确认对话框出现');
    console.log('   3. 如果有确认，请选择"确定"执行操作');
    console.log('   4. 观察最终的执行结果');

    console.log('\n🔍 步骤7: 验证更新结果');
    console.log('   1. 可以再次询问"请查看当前活动列表"来验证更新');
    console.log('   2. 检查海报是否已经成功更新');

    console.log('\n💡 重要提示:');
    console.log('   - 整个过程请保持耐心，AI处理可能需要时间');
    console.log('   - 如果遇到任何错误，请截图保存');
    console.log('   - 记录每个步骤的执行情况');
    console.log('   - 现在浏览器应该已经打开，请开始测试');

    console.log('\n🚀 浏览器正在打开中...');
    console.log('请按照上述步骤进行测试');

    // 打开浏览器并导航到登录页面
    await page.goto('http://localhost:5173/login-only.html', { waitUntil: 'networkidle' });

    console.log('\n✅ 浏览器已打开登录页面');
    console.log('📍 当前URL:', page.url());

    // 保持浏览器打开，等待用户手动操作
    console.log('\n📌 浏览器将保持打开状态，您可以按照上述步骤进行测试...');
    console.log('按 Ctrl+C 退出测试');

    // 保持进程运行，直到用户主动退出
    await new Promise((resolve, reject) => {
      process.on('SIGINT', resolve);
      process.on('SIGTERM', resolve);
    });

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
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
      if (fs.existsSync('/tmp/activity-poster.png')) {
        fs.unlinkSync('/tmp/activity-poster.png');
      }
      console.log('🧹 测试文件已清理');
    } catch (error) {
      console.log('⚠️ 清理文件时出错:', error.message);
    }
  }
}

// 运行测试
console.log('准备开始真实测试...');
console.log('按 Ctrl+C 可以随时退出');

testRealAIPosterWorkflow().catch(console.error);