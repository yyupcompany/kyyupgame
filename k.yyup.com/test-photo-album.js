import puppeteer from 'puppeteer';

async function testPhotoAlbum() {
    let browser;

    try {
        console.log('正在启动浏览器...');
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // 设置视口
        await page.setViewport({ width: 1280, height: 800 });

        console.log('正在访问相册页面...');
        await page.goto('http://127.0.0.1:5173/parent-center/photo-album', {
            waitUntil: 'networkidle2'
        });

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 检查是否需要登录
        const needLogin = await page.$('.login-form, .login-container, [data-testid="login"], #login-form');

        if (needLogin) {
            console.log('检测到登录页面，尝试快捷登录...');

            // 查找家长角色快捷登录按钮
            const parentLoginBtn = await page.$('[data-role="parent"], .parent-login, #parent-quick-login');

            if (parentLoginBtn) {
                await parentLoginBtn.click();
                console.log('点击家长快捷登录按钮');
            } else {
                // 尝试查找其他快捷登录按钮
                const quickLoginBtn = await page.$('.quick-login, [data-quick-login], .role-selector');
                if (quickLoginBtn) {
                    await quickLoginBtn.click();
                    console.log('点击快捷登录按钮');

                    // 等待角色选择
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // 选择家长角色
                    const parentRole = await page.$('[data-role="parent"], .role-parent, .parent-role');
                    if (parentRole) {
                        await parentRole.click();
                        console.log('选择家长角色');
                    }
                }
            }

            // 等待登录完成
            await new Promise(resolve => setTimeout(resolve, 2000));

            // 重新访问相册页面
            await page.goto('http://127.0.0.1:5173/parent-center/photo-album', {
                waitUntil: 'networkidle2'
            });
        }

        // 等待页面完全加载
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('正在分析相册页面...');

        // 获取页面标题
        const title = await page.title();
        console.log('页面标题:', title);

        // 检查统计信息
        const albumStats = await page.$$('.stat-card, .album-stat, .photo-count, .album-info');
        console.log('找到统计元素数量:', albumStats.length);

        for (let i = 0; i < albumStats.length; i++) {
            const text = await albumStats[i].evaluate(el => el.textContent);
            console.log(`统计信息 ${i + 1}:`, text);
        }

        // 检查相册视图
        const albumView = await page.$$('.album-item, .photo-album, .album-card');
        console.log('找到相册元素数量:', albumView.length);

        // 检查时间轴视图
        const timelineView = await page.$$('.timeline-item, .photo-timeline, .timeline-photo');
        console.log('找到时间轴元素数量:', timelineView.length);

        // 检查照片元素
        const photoElements = await page.$$('img, .photo-item, .image-container');
        console.log('找到照片元素数量:', photoElements.length);

        // 截图保存
        const screenshot = await page.screenshot({
            path: '/home/zhgue/kyyupgame/k.yyup.com/album-page-screenshot.png',
            fullPage: true
        });
        console.log('页面截图已保存');

        // 检查网络请求
        const networkRequests = [];
        page.on('request', request => {
            networkRequests.push({
                url: request.url(),
                method: request.method(),
                resourceType: request.resourceType()
            });
        });

        // 检查控制台错误
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push({
                type: msg.type(),
                text: msg.text()
            });
        });

        page.on('pageerror', error => {
            console.log('页面错误:', error.message);
        });

        // 等待一段时间收集网络和控制台信息
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 检查API请求
        const apiRequests = networkRequests.filter(req =>
            req.url.includes('/api/photo-album') ||
            req.url.includes('/api/photo') ||
            req.resourceType === 'xhr'
        );

        console.log('\n=== API请求信息 ===');
        apiRequests.forEach(req => {
            console.log(`${req.method} ${req.url}`);
        });

        // 检查控制台消息
        console.log('\n=== 控制台消息 ===');
        consoleMessages.slice(-10).forEach(msg => {
            console.log(`[${msg.type}] ${msg.text}`);
        });

        // 检查特定相册API响应
        try {
            const albumResponse = await page.evaluate(async () => {
                try {
                    const response = await fetch('/api/photo-album');
                    const data = await response.json();
                    return data;
                } catch (error) {
                    return { error: error.message };
                }
            });

            console.log('\n=== 相册API响应 ===');
            console.log(JSON.stringify(albumResponse, null, 2));
        } catch (error) {
            console.log('相册API调用失败:', error.message);
        }

        // 检查照片API响应
        try {
            const photosResponse = await page.evaluate(async () => {
                try {
                    const response = await fetch('/api/photo-album/photos');
                    const data = await response.json();
                    return data;
                } catch (error) {
                    return { error: error.message };
                }
            });

            console.log('\n=== 照片API响应 ===');
            console.log(JSON.stringify(photosResponse, null, 2));
        } catch (error) {
            console.log('照片API调用失败:', error.message);
        }

        console.log('\n=== 测试完成 ===');

    } catch (error) {
        console.error('测试过程中发生错误:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
testPhotoAlbum().catch(console.error);