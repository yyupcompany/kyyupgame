import puppeteer from 'puppeteer';

async function detailedAlbumTest() {
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

        // 监听所有网络请求
        const networkRequests = [];
        const failedRequests = [];

        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            const resourceType = request.resourceType();

            networkRequests.push({ url, method, resourceType });

            if (url.includes('/api/photo-album') || url.includes('/api/photo')) {
                console.log(`🌐 API请求: ${method} ${url}`);
            }
        });

        page.on('response', response => {
            const url = response.url();
            if (url.includes('/api/photo-album') || url.includes('/api/photo')) {
                const status = response.status();
                console.log(`📡 API响应: ${status} ${url}`);

                if (status >= 400) {
                    failedRequests.push({
                        url: url,
                        status: status,
                        statusText: response.statusText()
                    });
                }
            }
        });

        page.on('requestfailed', request => {
            const url = request.url();
            if (url.includes('/api/photo-album') || url.includes('/api/photo')) {
                console.log(`❌ API请求失败: ${url}`);
                failedRequests.push({
                    url: url,
                    error: request.failure().errorText
                });
            }
        });

        // 监听控制台消息
        const consoleMessages = [];
        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push({
                type: msg.type(),
                text: text,
                location: msg.location()
            });

            if (msg.type() === 'error' || msg.type() === 'warning') {
                console.log(`⚠️ 控制台${msg.type()}: ${text}`);
            }
        });

        page.on('pageerror', error => {
            console.log(`💥 页面错误: ${error.message}`);
            consoleMessages.push({
                type: 'error',
                text: error.message,
                location: error.stack
            });
        });

        console.log('正在访问相册页面...');
        await page.goto('http://127.0.0.1:5173/parent-center/photo-album', {
            waitUntil: 'networkidle2'
        });

        // 等待页面加载
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 检查页面URL和标题
        const currentUrl = page.url();
        const title = await page.title();
        console.log(`\n📄 页面信息:`);
        console.log(`- 当前URL: ${currentUrl}`);
        console.log(`- 页面标题: ${title}`);

        // 检查是否需要登录
        const needLogin = await page.evaluate(() => {
            const loginSelectors = [
                '.login-form',
                '.login-container',
                '[data-testid="login"]',
                '#login-form',
                '.login-page',
                '.auth-page'
            ];

            for (const selector of loginSelectors) {
                if (document.querySelector(selector)) {
                    return true;
                }
            }
            return false;
        });

        if (needLogin) {
            console.log('\n🔐 检测到需要登录，尝试快捷登录...');

            // 尝试快捷登录
            const loginSuccess = await page.evaluate(() => {
                try {
                    // 查找快捷登录按钮
                    const quickLoginBtn = document.querySelector(
                        '[data-role="parent"], .parent-login, #parent-quick-login, .quick-login, [data-quick-login]'
                    );

                    if (quickLoginBtn) {
                        quickLoginBtn.click();

                        // 等待并检查是否登录成功
                        setTimeout(() => {
                            // 如果有角色选择，选择家长
                            const parentRole = document.querySelector(
                                '[data-role="parent"], .role-parent, .parent-role'
                            );
                            if (parentRole) {
                                parentRole.click();
                            }
                        }, 1000);

                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('登录失败:', error);
                    return false;
                }
            });

            if (loginSuccess) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                await page.goto('http://127.0.0.1:5173/parent-center/photo-album', {
                    waitUntil: 'networkidle2'
                });
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        // 详细分析页面内容
        console.log('\n🔍 分析页面内容...');

        const pageAnalysis = await page.evaluate(() => {
            const analysis = {
                // 检查统计信息
                stats: {
                    albumCount: 0,
                    photoCount: 0,
                    statCards: []
                },
                // 检查相册元素
                albums: [],
                // 检查照片元素
                photos: [],
                // 检查视图组件
                viewComponents: {
                    albumView: false,
                    timelineView: false,
                    gridView: false,
                    listView: false
                },
                // 检查错误信息
                errorElements: [],
                // 检查加载状态
                loadingStates: []
            };

            // 查找统计信息
            const statElements = document.querySelectorAll(
                '.stat-card, .album-stat, .photo-count, .album-info, .summary-card, .number-display'
            );
            analysis.stats.statCards = Array.from(statElements).map(el => ({
                text: el.textContent.trim(),
                className: el.className
            }));

            // 查找相册元素
            const albumElements = document.querySelectorAll(
                '.album-item, .photo-album, .album-card, .album-thumbnail'
            );
            analysis.albums = Array.from(albumElements).map(el => ({
                text: el.textContent.trim(),
                className: el.className,
                hasImage: !!el.querySelector('img')
            }));

            // 查找照片元素
            const photoElements = document.querySelectorAll(
                'img, .photo-item, .image-container, .photo-thumbnail'
            );
            analysis.photos = Array.from(photoElements).map(el => {
                const img = el.tagName === 'IMG' ? el : el.querySelector('img');
                return {
                    src: img ? img.src : null,
                    alt: img ? img.alt : null,
                    className: el.className,
                    loaded: img ? img.complete : false
                };
            });

            // 检查视图组件
            const viewSelectors = {
                albumView: '.album-view, .album-container, .photo-album-view',
                timelineView: '.timeline, .timeline-view, .photo-timeline',
                gridView: '.grid, .photo-grid, .image-grid',
                listView: '.list, .photo-list, .album-list'
            };

            Object.keys(viewSelectors).forEach(view => {
                analysis.viewComponents[view] = !!document.querySelector(viewSelectors[view]);
            });

            // 检查错误信息
            const errorSelectors = [
                '.error, .error-message, .error-text',
                '.alert-error, .alert-danger',
                '[data-error], .has-error'
            ];
            errorSelectors.forEach(selector => {
                const errors = document.querySelectorAll(selector);
                analysis.errorElements.push(...Array.from(errors).map(el => ({
                    text: el.textContent.trim(),
                    className: el.className
                })));
            });

            // 检查加载状态
            const loadingSelectors = [
                '.loading, .loader, .spinner',
                '.skeleton, .skeleton-loader',
                '[data-loading], .is-loading'
            ];
            loadingSelectors.forEach(selector => {
                const loaders = document.querySelectorAll(selector);
                analysis.loadingStates.push(...Array.from(loaders).map(el => ({
                    className: el.className
                })));
            });

            return analysis;
        });

        console.log('\n📊 页面分析结果:');
        console.log('统计信息:', pageAnalysis.stats);
        console.log('相册数量:', pageAnalysis.albums.length);
        console.log('照片数量:', pageAnalysis.photos.length);
        console.log('视图组件:', pageAnalysis.viewComponents);
        console.log('错误元素:', pageAnalysis.errorElements.length);
        console.log('加载状态:', pageAnalysis.loadingStates.length);

        // 检查照片URL有效性
        console.log('\n🖼️ 照片URL检查:');
        pageAnalysis.photos.forEach((photo, index) => {
            if (photo.src) {
                const isValid = photo.src.startsWith('http') && !photo.src.includes('default-album.png');
                console.log(`照片${index + 1}: ${isValid ? '✅' : '❌'} ${photo.src.substring(0, 100)}...`);
            }
        });

        // 检查API响应
        console.log('\n🔌 API请求汇总:');
        console.log(`总请求数: ${networkRequests.length}`);
        console.log(`失败请求数: ${failedRequests.length}`);

        if (failedRequests.length > 0) {
            console.log('\n❌ 失败的请求:');
            failedRequests.forEach(req => {
                console.log(`- ${req.error || `${req.status} ${req.statusText}`}: ${req.url}`);
            });
        }

        // 检查控制台错误
        console.log('\n📝 控制台消息汇总:');
        const errors = consoleMessages.filter(msg => msg.type === 'error');
        const warnings = consoleMessages.filter(msg => msg.type === 'warning');

        console.log(`错误数量: ${errors.length}`);
        console.log(`警告数量: ${warnings.length}`);

        if (errors.length > 0) {
            console.log('\n❌ 控制台错误:');
            errors.forEach(error => {
                console.log(`- ${error.text}`);
            });
        }

        // 保存详细截图
        await page.screenshot({
            path: '/home/zhgue/kyyupgame/k.yyup.com/detailed-album-screenshot.png',
            fullPage: true
        });

        console.log('\n✅ 测试完成！详细截图已保存。');

        // 返回测试结果
        return {
            success: true,
            pageAnalysis,
            networkRequests,
            failedRequests,
            consoleMessages
        };

    } catch (error) {
        console.error('测试过程中发生错误:', error);
        return {
            success: false,
            error: error.message
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
detailedAlbumTest()
    .then(result => {
        console.log('\n🎯 最终测试结果:');
        if (result.success) {
            console.log('✅ 测试通过');

            // 检查是否有问题
            const issues = [];

            if (result.pageAnalysis.photos.length === 0) {
                issues.push('页面没有显示任何照片');
            }

            if (result.failedRequests.length > 0) {
                issues.push(`有${result.failedRequests.length}个失败的API请求`);
            }

            const errors = result.consoleMessages.filter(msg => msg.type === 'error');
            if (errors.length > 0) {
                issues.push(`控制台有${errors.length}个错误`);
            }

            if (issues.length > 0) {
                console.log('\n⚠️ 发现的问题:');
                issues.forEach(issue => console.log(`- ${issue}`));
            } else {
                console.log('🎉 没有发现明显问题');
            }
        } else {
            console.log('❌ 测试失败:', result.error);
        }
    })
    .catch(console.error);