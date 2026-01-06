const puppeteer = require('puppeteer');
const fs = require('fs');

async function testAIUploadFeatures() {
    let browser;
    try {
        console.log('🚀 AI助手文件上传功能深度测试...');

        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1400, height: 1000 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // 监听网络请求，特别是文件上传相关的请求
        page.on('request', request => {
            const url = request.url();
            const method = request.method();
            if (method === 'POST' && (url.includes('/upload') || url.includes('/file'))) {
                console.log('📤 发现文件上传请求:', url, method);
            }
        });

        // 监听所有响应
        page.on('response', response => {
            const url = response.url();
            if (url.includes('/upload') || url.includes('/file') || url.includes('/ai')) {
                console.log('📥 文件相关响应:', url, response.status());
            }
        });

        console.log('📍 访问AI助手页面...');
        await page.goto('http://localhost:5173/ai/query', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 5000));

        // 尝试登录（如果需要）
        const currentUrl = page.url();
        if (currentUrl.includes('/login')) {
            console.log('🔐 需要登录...');
            // 点击admin快捷登录
            const clicked = await page.evaluate(() => {
                const buttons = document.querySelectorAll('button, [role="button"]');
                for (let button of buttons) {
                    if (button.textContent && button.textContent.includes('admin')) {
                        button.click();
                        return true;
                    }
                }
                return false;
            });

            if (clicked) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                await page.goto('http://localhost:5173/ai/query', {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        console.log('🔍 第一步：查找AI助手按钮并点击打开侧边栏...');

        // 查找AI助手按钮
        const aiButtons = await page.$$('.ai-avatar, [title*="AI助手"], .ai-text');
        let aiSidebarOpened = false;

        if (aiButtons.length > 0) {
            console.log('✅ 找到AI助手按钮，数量:', aiButtons.length);
            for (let i = 0; i < aiButtons.length; i++) {
                try {
                    await aiButtons[i].click();
                    console.log(`🖱️ 点击第${i+1}个AI助手按钮`);
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // 检查是否出现了AI侧边栏
                    const aiSidebar = await page.$('.ai-sidebar-layout, .ai-sidebar-slot, [class*="ai-sidebar"]');
                    if (aiSidebar) {
                        console.log('✅ AI侧边栏已打开！');
                        aiSidebarOpened = true;
                        break;
                    }
                } catch (error) {
                    console.log(`⚠️ 点击AI按钮${i+1}失败:`, error.message);
                }
            }
        } else {
            console.log('⚠️ 未找到明显的AI助手按钮，尝试其他方式...');

            // 尝试通过JavaScript查找并点击
            const clicked = await page.evaluate(() => {
                // 查找包含"AI"文本的可点击元素
                const allElements = document.querySelectorAll('*');
                for (let element of allElements) {
                    const text = element.textContent || '';
                    const title = element.getAttribute('title') || '';

                    if ((text.includes('AI') || title.includes('AI') || title.includes('助手')) &&
                        (element.tagName === 'BUTTON' || element.tagName === 'DIV' || element.onclick)) {
                        element.click();
                        return true;
                    }
                }
                return false;
            });

            if (clicked) {
                await new Promise(resolve => setTimeout(resolve, 3000));
                const aiSidebar = await page.$('.ai-sidebar-layout, .ai-sidebar-slot, [class*="ai-sidebar"]');
                if (aiSidebar) {
                    console.log('✅ 通过JavaScript打开了AI侧边栏！');
                    aiSidebarOpened = true;
                }
            }
        }

        // 截图当前状态
        await page.screenshot({ path: 'ai-after-click.png', fullPage: true });
        console.log('📸 保存点击后的截图: ai-after-click.png');

        if (aiSidebarOpened) {
            console.log('🎉 第二步：AI侧边栏已打开，分析侧边栏内容...');

            await new Promise(resolve => setTimeout(resolve, 2000));

            // 分析侧边栏内容
            const sidebarAnalysis = await page.evaluate(() => {
                const sidebar = document.querySelector('.ai-sidebar-layout, .ai-sidebar-slot, [class*="ai-sidebar"]');
                if (!sidebar) return null;

                const analysis = {
                    exists: true,
                    innerHTML: sidebar.innerHTML.substring(0, 2000),
                    textContent: sidebar.innerText.substring(0, 1000),
                    elements: {
                        inputs: sidebar.querySelectorAll('input, textarea').length,
                        buttons: sidebar.querySelectorAll('button, [role="button"]').length,
                        fileInputs: sidebar.querySelectorAll('input[type="file"]').length,
                        textareas: sidebar.querySelectorAll('textarea').length,
                        uploadElements: sidebar.querySelectorAll('[class*="upload"], [class*="文件"], [class*="图片"]').length
                    }
                };

                // 查找隐藏的文件输入框
                const hiddenFileInputs = Array.from(sidebar.querySelectorAll('input[type="file"]')).map(input => ({
                    id: input.id,
                    className: input.className,
                    style: input.style.cssText,
                    accept: input.accept,
                    multiple: input.multiple,
                    hidden: input.type === 'hidden' || input.style.display === 'none' || input.offsetParent === null
                }));

                analysis.hiddenFileInputs = hiddenFileInputs;

                // 查找可能触发文件上传的元素
                const uploadTriggers = Array.from(sidebar.querySelectorAll('*')).filter(el => {
                    const text = el.textContent || '';
                    const className = el.className || '';
                    return text.includes('上传') || text.includes('文件') || text.includes('图片') ||
                           className.includes('upload') || className.includes('file') || className.includes('image');
                }).map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    textContent: (el.textContent || '').substring(0, 50),
                    onclick: !!el.onclick,
                    clickable: el.style.cursor === 'pointer' || el.tagName === 'BUTTON'
                }));

                analysis.uploadTriggers = uploadTriggers;

                return analysis;
            });

            console.log('📊 侧边栏分析结果:');
            console.log('  - 存在:', sidebarAnalysis.exists);
            console.log('  - 输入框:', sidebarAnalysis.elements.inputs);
            console.log('  - 按钮:', sidebarAnalysis.elements.buttons);
            console.log('  - 文件上传框:', sidebarAnalysis.elements.fileInputs);
            console.log('  - 文本域:', sidebarAnalysis.elements.textareas);
            console.log('  - 上传相关元素:', sidebarAnalysis.elements.uploadElements);
            console.log('  - 隐藏的文件输入框:', sidebarAnalysis.hiddenFileInputs.length);
            console.log('  - 上传触发器:', sidebarAnalysis.uploadTriggers.length);

            // 如果找到隐藏的文件上传框，尝试使用它们
            if (sidebarAnalysis.hiddenFileInputs.length > 0) {
                console.log('📤 第三步：测试隐藏的文件上传功能...');

                const testDocPath = '/home/zhgue/kyyupgame/k.yyup.com/test-files/test-document.txt';
                const testImagePath = '/home/zhgue/kyyupgame/k.yyup.com/test-files/test-image.svg';

                // 尝试上传文档
                if (fs.existsSync(testDocPath)) {
                    try {
                        const fileInput = await page.$('input[type="file"]');
                        if (fileInput) {
                            await fileInput.uploadFile(testDocPath);
                            console.log('✅ 成功上传测试文档:', testDocPath);
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    } catch (error) {
                        console.log('⚠️ 文档上传失败:', error.message);
                    }
                }

                // 尝试上传图片
                if (fs.existsSync(testImagePath)) {
                    try {
                        const fileInput = await page.$('input[type="file"]');
                        if (fileInput) {
                            await fileInput.uploadFile(testImagePath);
                            console.log('✅ 成功上传测试图片:', testImagePath);
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    } catch (error) {
                        console.log('⚠️ 图片上传失败:', error.message);
                    }
                }
            }

            // 尝试点击上传触发器
            if (sidebarAnalysis.uploadTriggers.length > 0) {
                console.log('🖱️ 第四步：测试上传触发器...');

                for (let trigger of sidebarAnalysis.uploadTriggers.slice(0, 3)) {  // 最多测试3个
                    try {
                        const element = await page.$(trigger.className ? `.${trigger.className.split(' ')[0]}` : '*');
                        if (element && trigger.clickable) {
                            await element.click();
                            console.log('✅ 点击了上传触发器:', trigger.textContent);
                            await new Promise(resolve => setTimeout(resolve, 1000));

                            // 检查是否出现了文件选择对话框
                            const fileInputsAfterClick = await page.$$('input[type="file"]');
                            if (fileInputsAfterClick.length > 0) {
                                console.log('✅ 点击后出现了文件输入框！');
                            }
                        }
                    } catch (error) {
                        console.log('⚠️ 点击上传触发器失败:', error.message);
                    }
                }
            }

        } else {
            console.log('❌ 未能打开AI侧边栏，尝试其他方法...');

            // 尝试查找页面中的任何文件上传功能
            console.log('🔍 第五步：搜索页面中的文件上传功能...');

            const allFileInputs = await page.evaluate(() => {
                const inputs = Array.from(document.querySelectorAll('input[type="file"]'));
                return inputs.map(input => ({
                    id: input.id,
                    className: input.className,
                    style: input.style.cssText,
                    accept: input.accept,
                    multiple: input.multiple,
                    visible: input.offsetParent !== null,
                    parentClass: input.parentElement ? input.parentElement.className : ''
                }));
            });

            console.log('📝 页面中所有文件上传框:', allFileInputs.length);
            allFileInputs.forEach((input, index) => {
                console.log(`  ${index + 1}. ID: ${input.id}, 可见: ${input.visible}, 父级类: ${input.parentClass}`);
            });
        }

        // 最终截图
        await page.screenshot({ path: 'ai-final-state.png', fullPage: true });
        console.log('📸 保存最终状态截图: ai-final-state.png');

        console.log('✅ AI助手文件上传功能测试完成');
        return { success: true, aiSidebarOpened };

    } catch (error) {
        console.error('❌ 测试过程中出错:', error.message);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 运行测试
testAIUploadFeatures().then(result => {
    console.log('\n🎯 测试总结:');
    console.log('==================');
    if (result.success) {
        console.log('✅ 测试成功完成');
        console.log('🤖 AI侧边栏状态:', result.aiSidebarOpened ? '✅ 成功打开' : '❌ 未打开');

        if (result.aiSidebarOpened) {
            console.log('🎉 AI助手侧边栏已打开，可以进行交互测试');
        } else {
            console.log('💡 建议:');
            console.log('  1. 检查AI助手按钮是否正确绑定事件');
            console.log('  2. 确认侧边栏组件是否正确加载');
            console.log('  3. 验证用户权限是否足够');
        }
    } else {
        console.log('❌ 测试失败');
    }
}).catch(console.error);